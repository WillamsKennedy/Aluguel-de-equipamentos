<?php

declare(strict_types=1);

namespace Rental\Infrastructure\Persistence\PDO;

use DateTimeImmutable;
use PDO;
use Rental\Domain\Reservation\Reservation;
use Rental\Domain\Reservation\ReservationRepositoryInterface;
use Rental\Domain\Reservation\ValueObjects\RentalPeriod;
use Rental\Domain\Reservation\ValueObjects\RentalValue;

final class PdoReservationRepository implements ReservationRepositoryInterface
{
    public function __construct(private readonly PDO $pdo) {}

    public function findById(string $id): ?Reservation
    {
        $stmt = $this->pdo->prepare('SELECT * FROM reservations WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ? $this->hydrate($row) : null;
    }

    public function save(Reservation $reservation): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO reservations
             (id, client_id, equipment_id, start_date, end_date, daily_rate, days,
              total_value, deposit, contract_signed, contract_path,
              cancelled, deposit_retained, actual_return_at, created_at)
             VALUES
             (:id, :client_id, :equipment_id, :start_date, :end_date, :daily_rate, :days,
              :total_value, :deposit, :contract_signed, :contract_path,
              :cancelled, :deposit_retained, :actual_return_at, :created_at)'
        );
        $stmt->execute($this->toRow($reservation));
    }

    public function update(Reservation $reservation): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE reservations SET
             contract_signed   = :contract_signed,
             contract_path     = :contract_path,
             cancelled         = :cancelled,
             deposit_retained  = :deposit_retained,
             actual_return_at  = :actual_return_at
             WHERE id = :id'
        );

        $row = $this->toRow($reservation);
        $stmt->execute([
            ':id'              => $row[':id'],
            ':contract_signed' => $row[':contract_signed'],
            ':contract_path'   => $row[':contract_path'],
            ':cancelled'       => $row[':cancelled'],
            ':deposit_retained'=> $row[':deposit_retained'],
            ':actual_return_at'=> $row[':actual_return_at'],
        ]);
    }

    public function findOverlapping(
        string $equipmentId,
        DateTimeImmutable $start,
        DateTimeImmutable $end
    ): array {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM reservations
             WHERE equipment_id = :equipment_id
               AND cancelled    = 0
               AND start_date   < :end_date
               AND end_date     > :start_date'
        );

        $stmt->execute([
            ':equipment_id' => $equipmentId,
            ':start_date'   => $start->format('Y-m-d'),
            ':end_date'     => $end->format('Y-m-d'),
        ]);

        return array_map([$this, 'hydrate'], $stmt->fetchAll());
    }

    public function findByClientId(string $clientId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM reservations WHERE client_id = :client_id ORDER BY created_at DESC'
        );
        $stmt->execute([':client_id' => $clientId]);

        return array_map([$this, 'hydrate'], $stmt->fetchAll());
    }

    private function toRow(Reservation $reservation): array
    {
        return [
            ':id'              => $reservation->getId(),
            ':client_id'       => $reservation->getClientId(),
            ':equipment_id'    => $reservation->getEquipmentId(),
            ':start_date'      => $reservation->getPeriod()->getStartDate()->format('Y-m-d'),
            ':end_date'        => $reservation->getPeriod()->getEndDate()->format('Y-m-d'),
            ':daily_rate'      => $reservation->getValue()->getDailyRate(),
            ':days'            => $reservation->getValue()->getDays(),
            ':total_value'     => $reservation->getValue()->getTotal(),
            ':deposit'         => $reservation->getValue()->getDeposit(),
            ':contract_signed' => $reservation->isContractSigned() ? 1 : 0,
            ':contract_path'   => $reservation->getContractPath(),
            ':cancelled'       => $reservation->isCancelled() ? 1 : 0,
            ':deposit_retained'=> $reservation->isDepositRetained() ? 1 : 0,
            ':actual_return_at'=> $reservation->getActualReturnAt()?->format('Y-m-d H:i:s'),
            ':created_at'      => $reservation->getCreatedAt()->format('Y-m-d H:i:s'),
        ];
    }

    private function hydrate(array $row): Reservation
    {
        $period = new RentalPeriod(
            new DateTimeImmutable($row['start_date']),
            new DateTimeImmutable($row['end_date'])
        );

        $value = new RentalValue((float)$row['daily_rate'], (int)$row['days']);

        $reservation = new Reservation(
            $row['id'],
            $row['client_id'],
            $row['equipment_id'],
            $period,
            $value,
            new DateTimeImmutable($row['created_at'])
        );

        if ($row['contract_signed'] && $row['contract_path']) {
            $reservation->signContract($row['contract_path']);
        }

        if ($row['cancelled']) {
            $reservation->cancel((bool)$row['deposit_retained']);
        }

        if ($row['actual_return_at']) {
            $reservation->registerReturn(new DateTimeImmutable($row['actual_return_at']));
        }

        return $reservation;
    }
}
