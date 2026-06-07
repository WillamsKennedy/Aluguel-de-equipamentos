<?php

declare(strict_types=1);

namespace Rental\Domain\Reservation;

use DateTimeImmutable;

interface ReservationRepositoryInterface
{
    public function findById(string $id): ?Reservation;

    public function save(Reservation $reservation): void;

    public function update(Reservation $reservation): void;

    /**
     * Returns active (non-cancelled) reservations that overlap with the given period for the equipment.
     * @return Reservation[]
     */
    public function findOverlapping(
        string $equipmentId,
        DateTimeImmutable $start,
        DateTimeImmutable $end
    ): array;

    /** @return Reservation[] */
    public function findByClientId(string $clientId): array;
}
