<?php

declare(strict_types=1);

namespace Rental\Application\Reservation;

use RuntimeException;
use Rental\Domain\Equipment\EquipmentRepositoryInterface;
use Rental\Domain\Equipment\EquipmentStatus;
use Rental\Domain\Reservation\ReservationRepositoryInterface;
use Rental\Domain\Reservation\ReturnChecklist;
use Rental\Infrastructure\Clock\ClockInterface;

final class ProcessReturnService
{
    public function __construct(
        private readonly ReservationRepositoryInterface $reservationRepository,
        private readonly EquipmentRepositoryInterface $equipmentRepository,
        private readonly ClockInterface $clock
    ) {}

    /**
     * @return array{lateFee: float, hasDamage: bool, extraDays: int}
     */
    public function execute(string $reservationId, ReturnChecklist $checklist, string $processedByUserId): array
    {
        $reservation = $this->reservationRepository->findById($reservationId);

        if ($reservation === null) {
            throw new RuntimeException("Reserva não encontrada: '{$reservationId}'");
        }

        if ($reservation->isCancelled()) {
            throw new RuntimeException("Não é possível registrar devolução de reserva cancelada: '{$reservationId}'");
        }

        $now       = $this->clock->now();
        $extraDays = $reservation->calculateExtraDays($now);
        $lateFee   = $reservation->getValue()->calculateLateFee($extraDays);
        $hasDamage = $checklist->hasDamage();

        $reservation->registerReturn($now);
        $this->reservationRepository->update($reservation);

        $equipment   = $this->equipmentRepository->findById($reservation->getEquipmentId());
        $newStatus   = $hasDamage ? EquipmentStatus::Damaged : EquipmentStatus::Available;
        $notes       = $hasDamage
            ? "Devolvido com avarias. Reserva {$reservationId}"
            : "Devolvido sem avarias. Reserva {$reservationId}";

        if ($equipment !== null) {
            $equipment->transitionTo($newStatus, $now, $processedByUserId, $notes);
            $this->equipmentRepository->update($equipment);
        }

        return [
            'lateFee'   => $lateFee,
            'hasDamage' => $hasDamage,
            'extraDays' => $extraDays,
        ];
    }
}
