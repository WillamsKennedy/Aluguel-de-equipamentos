<?php

declare(strict_types=1);

namespace Rental\Domain\Equipment;

use DateTimeImmutable;

interface EquipmentRepositoryInterface
{
    public function findById(string $id): ?Equipment;

    public function findBySerialNumber(string $serialNumber): ?Equipment;

    public function existsBySerialNumber(string $serialNumber): bool;

    public function save(Equipment $equipment): void;

    public function update(Equipment $equipment): void;

    /**
     * Returns available equipment not reserved in the given period.
     * @return Equipment[]
     */
    public function findAvailable(
        ?string $name,
        ?string $category,
        ?DateTimeImmutable $periodStart,
        ?DateTimeImmutable $periodEnd
    ): array;
}
