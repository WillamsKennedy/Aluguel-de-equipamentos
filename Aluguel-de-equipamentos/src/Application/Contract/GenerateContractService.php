<?php

declare(strict_types=1);

namespace Rental\Application\Contract;

use RuntimeException;
use Rental\Domain\Client\ClientRepositoryInterface;
use Rental\Domain\Equipment\EquipmentRepositoryInterface;
use Rental\Domain\Reservation\ReservationRepositoryInterface;
use Rental\Infrastructure\PDF\ContractGeneratorInterface;

final class GenerateContractService
{
    public function __construct(
        private readonly ReservationRepositoryInterface $reservationRepository,
        private readonly ClientRepositoryInterface $clientRepository,
        private readonly EquipmentRepositoryInterface $equipmentRepository,
        private readonly ContractGeneratorInterface $contractGenerator
    ) {}

    /**
     * Generates the PDF contract and signs the reservation.
     * Returns the path to the generated PDF.
     */
    public function execute(string $reservationId): string
    {
        $reservation = $this->reservationRepository->findById($reservationId);
        if ($reservation === null) {
            throw new RuntimeException("Reserva não encontrada: '{$reservationId}'");
        }

        $client = $this->clientRepository->findById($reservation->getClientId());
        if ($client === null) {
            throw new RuntimeException("Cliente não encontrado: '{$reservation->getClientId()}'");
        }

        $equipment = $this->equipmentRepository->findById($reservation->getEquipmentId());
        if ($equipment === null) {
            throw new RuntimeException("Equipamento não encontrado: '{$reservation->getEquipmentId()}'");
        }

        $path = $this->contractGenerator->generate($reservation, $client, $equipment);

        $reservation->signContract($path);
        $this->reservationRepository->update($reservation);

        return $path;
    }
}
