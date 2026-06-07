<?php

declare(strict_types=1);

namespace Rental\Application\Reservation;

use DateTimeImmutable;
use Ramsey\Uuid\Uuid;
use Rental\Domain\Client\ClientRepositoryInterface;
use Rental\Domain\Equipment\EquipmentRepositoryInterface;
use Rental\Domain\Equipment\EquipmentStatus;
use Rental\Domain\Exceptions\InactiveClientException;
use Rental\Domain\Exceptions\OverlappingReservationException;
use Rental\Domain\Exceptions\UnavailableEquipmentException;
use Rental\Domain\Reservation\Reservation;
use Rental\Domain\Reservation\ReservationRepositoryInterface;
use Rental\Domain\Reservation\ValueObjects\RentalPeriod;
use Rental\Domain\Reservation\ValueObjects\RentalValue;
use Rental\Infrastructure\Clock\ClockInterface;

final class CreateReservationService
{
    public function __construct(
        private readonly ClientRepositoryInterface $clientRepository,
        private readonly EquipmentRepositoryInterface $equipmentRepository,
        private readonly ReservationRepositoryInterface $reservationRepository,
        private readonly ClockInterface $clock
    ) {}

    public function execute(
        string $clientId,
        string $equipmentId,
        DateTimeImmutable $startDate,
        DateTimeImmutable $endDate
    ): Reservation {
        $client = $this->clientRepository->findById($clientId);

        if ($client === null || !$client->isActive()) {
            throw new InactiveClientException(
                $clientId,
                $client?->getName() ?? 'desconhecido'
            );
        }

        $equipment = $this->equipmentRepository->findById($equipmentId);

        if ($equipment === null || !$equipment->isAvailable()) {
            throw new UnavailableEquipmentException(
                $equipmentId,
                $equipment?->getStatus()->value ?? 'não encontrado'
            );
        }

        $period = new RentalPeriod($startDate, $endDate);

        $overlapping = $this->reservationRepository->findOverlapping(
            $equipmentId,
            $startDate,
            $endDate
        );

        if (!empty($overlapping)) {
            $existing = $overlapping[0];
            throw new OverlappingReservationException(
                $equipmentId,
                $existing->getId(),
                $existing->getPeriod()->getStartDate()->format('Y-m-d'),
                $existing->getPeriod()->getEndDate()->format('Y-m-d')
            );
        }

        $value = new RentalValue($equipment->getDailyRate(), $period->getDays());

        $reservation = new Reservation(
            Uuid::uuid4()->toString(),
            $clientId,
            $equipmentId,
            $period,
            $value,
            $this->clock->now()
        );

        $equipment->transitionTo(
            EquipmentStatus::Reserved,
            $this->clock->now(),
            $clientId,
            "Reserva {$reservation->getId()}"
        );

        $this->equipmentRepository->update($equipment);
        $this->reservationRepository->save($reservation);

        return $reservation;
    }
}
