<?php

declare(strict_types=1);

namespace Rental\Domain\Equipment;

use DateTimeImmutable;

final class StatusHistoryEntry
{
    public function __construct(
        private readonly string $equipmentId,
        private readonly EquipmentStatus $fromStatus,
        private readonly EquipmentStatus $toStatus,
        private readonly DateTimeImmutable $changedAt,
        private readonly string $changedByUserId,
        private readonly ?string $notes = null
    ) {}

    public function getEquipmentId(): string
    {
        return $this->equipmentId;
    }

    public function getFromStatus(): EquipmentStatus
    {
        return $this->fromStatus;
    }

    public function getToStatus(): EquipmentStatus
    {
        return $this->toStatus;
    }

    public function getChangedAt(): DateTimeImmutable
    {
        return $this->changedAt;
    }

    public function getChangedByUserId(): string
    {
        return $this->changedByUserId;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }
}
