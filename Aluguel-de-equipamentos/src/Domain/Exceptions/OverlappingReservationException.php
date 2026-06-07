<?php

declare(strict_types=1);

namespace Rental\Domain\Exceptions;

use RuntimeException;

final class OverlappingReservationException extends RuntimeException
{
    public function __construct(
        private readonly string $equipmentId,
        private readonly string $existingReservationId,
        string $conflictStart,
        string $conflictEnd
    ) {
        parent::__construct(
            sprintf(
                'Equipamento já reservado no período solicitado. Equipamento: %s, Reserva conflitante: %s (%s → %s)',
                $equipmentId,
                $existingReservationId,
                $conflictStart,
                $conflictEnd
            )
        );
    }

    public function getEquipmentId(): string
    {
        return $this->equipmentId;
    }

    public function getExistingReservationId(): string
    {
        return $this->existingReservationId;
    }
}
