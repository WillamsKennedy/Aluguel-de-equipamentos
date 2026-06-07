<?php

declare(strict_types=1);

namespace Rental\Domain\Equipment;

use DateTimeImmutable;
use Rental\Domain\Exceptions\InvalidStatusTransitionException;

final class Equipment
{
    private EquipmentStatus $status;
    /** @var StatusHistoryEntry[] */
    private array $statusHistory = [];

    public function __construct(
        private readonly string $id,
        private readonly string $name,
        private readonly string $category,
        private readonly string $serialNumber,
        private readonly float $dailyRate,
        /** @var string[] */
        private array $photoPaths = []
    ) {
        $this->status = EquipmentStatus::Available;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getCategory(): string
    {
        return $this->category;
    }

    public function getSerialNumber(): string
    {
        return $this->serialNumber;
    }

    public function getDailyRate(): float
    {
        return $this->dailyRate;
    }

    public function getStatus(): EquipmentStatus
    {
        return $this->status;
    }

    public function isAvailable(): bool
    {
        return $this->status === EquipmentStatus::Available;
    }

    public function getPhotoPaths(): array
    {
        return $this->photoPaths;
    }

    /** @return StatusHistoryEntry[] */
    public function getStatusHistory(): array
    {
        return $this->statusHistory;
    }

    public function transitionTo(
        EquipmentStatus $newStatus,
        DateTimeImmutable $changedAt,
        string $changedByUserId,
        ?string $notes = null
    ): void {
        if (!$this->status->canTransitionTo($newStatus)) {
            throw new InvalidStatusTransitionException(
                $this->status->value,
                $newStatus->value,
                $this->id
            );
        }

        $this->statusHistory[] = new StatusHistoryEntry(
            $this->id,
            $this->status,
            $newStatus,
            $changedAt,
            $changedByUserId,
            $notes
        );

        $this->status = $newStatus;
    }

    public function addPhoto(string $path): void
    {
        $this->photoPaths[] = $path;
    }
}
