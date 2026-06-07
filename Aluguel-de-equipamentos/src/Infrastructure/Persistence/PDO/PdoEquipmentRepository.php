<?php

declare(strict_types=1);

namespace Rental\Infrastructure\Persistence\PDO;

use DateTimeImmutable;
use PDO;
use Ramsey\Uuid\Uuid;
use Rental\Domain\Equipment\Equipment;
use Rental\Domain\Equipment\EquipmentRepositoryInterface;
use Rental\Domain\Equipment\EquipmentStatus;
use Rental\Domain\Equipment\StatusHistoryEntry;

final class PdoEquipmentRepository implements EquipmentRepositoryInterface
{
    public function __construct(private readonly PDO $pdo) {}

    public function findById(string $id): ?Equipment
    {
        $stmt = $this->pdo->prepare('SELECT * FROM equipment WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ? $this->hydrate($row) : null;
    }

    public function findBySerialNumber(string $serialNumber): ?Equipment
    {
        $stmt = $this->pdo->prepare('SELECT * FROM equipment WHERE serial_number = :sn LIMIT 1');
        $stmt->execute([':sn' => $serialNumber]);
        $row = $stmt->fetch();

        return $row ? $this->hydrate($row) : null;
    }

    public function existsBySerialNumber(string $serialNumber): bool
    {
        $stmt = $this->pdo->prepare(
            "SELECT COUNT(*) FROM equipment WHERE serial_number = :sn AND status != 'avariado'"
        );
        $stmt->execute([':sn' => $serialNumber]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function save(Equipment $equipment): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO equipment (id, name, category, serial_number, daily_rate, status, photo_paths)
             VALUES (:id, :name, :category, :serial_number, :daily_rate, :status, :photo_paths)'
        );
        $stmt->execute($this->toRow($equipment));
        $this->saveHistory($equipment);
    }

    public function update(Equipment $equipment): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE equipment SET name = :name, category = :category, serial_number = :serial_number,
             daily_rate = :daily_rate, status = :status, photo_paths = :photo_paths
             WHERE id = :id'
        );
        $stmt->execute($this->toRow($equipment));
        $this->saveHistory($equipment);
    }

    public function findAvailable(
        ?string $name,
        ?string $category,
        ?DateTimeImmutable $periodStart,
        ?DateTimeImmutable $periodEnd
    ): array {
        $sql    = "SELECT e.* FROM equipment e WHERE e.status = 'disponivel'";
        $params = [];

        if ($name !== null) {
            $sql           .= ' AND e.name LIKE :name';
            $params[':name'] = '%' . $name . '%';
        }

        if ($category !== null) {
            $sql               .= ' AND e.category = :category';
            $params[':category'] = $category;
        }

        if ($periodStart !== null && $periodEnd !== null) {
            $sql .= " AND e.id NOT IN (
                SELECT r.equipment_id FROM reservations r
                WHERE r.cancelled = 0
                AND r.start_date < :period_end
                AND r.end_date   > :period_start
            )";
            $params[':period_start'] = $periodStart->format('Y-m-d');
            $params[':period_end']   = $periodEnd->format('Y-m-d');
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return array_map([$this, 'hydrate'], $stmt->fetchAll());
    }

    private function saveHistory(Equipment $equipment): void
    {
        foreach ($equipment->getStatusHistory() as $entry) {
            $check = $this->pdo->prepare(
                'SELECT COUNT(*) FROM equipment_status_history WHERE equipment_id = :eid AND changed_at = :at'
            );
            $check->execute([
                ':eid' => $entry->getEquipmentId(),
                ':at'  => $entry->getChangedAt()->format('Y-m-d H:i:s'),
            ]);
            if ((int)$check->fetchColumn() > 0) {
                continue;
            }

            $stmt = $this->pdo->prepare(
                'INSERT INTO equipment_status_history
                 (id, equipment_id, from_status, to_status, changed_at, changed_by_user, notes)
                 VALUES (:id, :equipment_id, :from, :to, :at, :user, :notes)'
            );
            $stmt->execute([
                ':id'          => Uuid::uuid4()->toString(),
                ':equipment_id'=> $entry->getEquipmentId(),
                ':from'        => $entry->getFromStatus()->value,
                ':to'          => $entry->getToStatus()->value,
                ':at'          => $entry->getChangedAt()->format('Y-m-d H:i:s'),
                ':user'        => $entry->getChangedByUserId(),
                ':notes'       => $entry->getNotes(),
            ]);
        }
    }

    private function toRow(Equipment $equipment): array
    {
        return [
            ':id'           => $equipment->getId(),
            ':name'         => $equipment->getName(),
            ':category'     => $equipment->getCategory(),
            ':serial_number'=> $equipment->getSerialNumber(),
            ':daily_rate'   => $equipment->getDailyRate(),
            ':status'       => $equipment->getStatus()->value,
            ':photo_paths'  => implode(',', $equipment->getPhotoPaths()),
        ];
    }

    private function hydrate(array $row): Equipment
    {
        $photos = $row['photo_paths'] ? explode(',', $row['photo_paths']) : [];

        $equipment = new Equipment(
            $row['id'],
            $row['name'],
            $row['category'],
            $row['serial_number'],
            (float)$row['daily_rate'],
            $photos
        );

        $targetStatus = EquipmentStatus::from($row['status']);
        if ($targetStatus !== EquipmentStatus::Available) {
            // Restore status without recording history (hydration, not transition)
            $reflection = new \ReflectionProperty(Equipment::class, 'status');
            $reflection->setAccessible(true);
            $reflection->setValue($equipment, $targetStatus);
        }

        return $equipment;
    }
}
