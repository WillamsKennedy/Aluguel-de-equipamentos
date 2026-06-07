<?php

declare(strict_types=1);

namespace Rental\Application\Reservation;

use RuntimeException;
use Rental\Domain\Equipment\EquipmentRepositoryInterface;
use Rental\Domain\Equipment\EquipmentStatus;
use Rental\Domain\Reservation\ReservationRepositoryInterface;
use Rental\Infrastructure\Clock\ClockInterface;

final class CancelReservationService
{
    private const MIN_HOURS_FREE_CANCEL = 48.0;

    public function __construct(
        private readonly ReservationRepositoryInterface $reservationRepository,
        private readonly EquipmentRepositoryInterface $equipmentRepository,
        private readonly ClockInterface $clock
    ) {}

    /**
     * Returns true if deposit was retained, false if refunded.
     */
    public function execute(string $reservationId, string $cancelledByUserId): bool
    {
        $reservation = $this->reservationRepository->findById($reservationId);

        if ($reservation === null) {
            throw new RuntimeException("Reserva não encontrada: '{$reservationId}'");
        }

        if ($reservation->isCancelled()) {
            throw new RuntimeException("Reserva já cancelada: '{$reservationId}'");
        }

        $hoursUntilStart = $reservation->getPeriod()->hoursUntilStart($this->clock->now());

        $retainDeposit = $hoursUntilStart < self::MIN_HOURS_FREE_CANCEL;

        $reservation->cancel($retainDeposit);

        $equipment = $this->equipmentRepository->findById($reservation->getEquipmentId());

        if ($equipment !== null && !$equipment->isAvailable()) {
            $equipment->transitionTo(
                EquipmentStatus::Available,
                $this->clock->now(),
                $cancelledByUserId,
                "Cancelamento reserva {$reservationId}"
            );
            $this->equipmentRepository->update($equipment);
        }

        $this->reservationRepository->update($reservation);

        return $retainDeposit;
    }
}
