<?php

declare(strict_types=1);

namespace Rental\Domain\Exceptions;

use RuntimeException;

final class EarlyReturnCancellationException extends RuntimeException
{
    public function __construct(string $reservationId, float $hoursUntilStart)
    {
        parent::__construct(
            sprintf(
                'Cancelamento com menos de 48h de antecedência (%.1f horas). A caução será retida. Reserva: %s',
                $hoursUntilStart,
                $reservationId
            )
        );
    }
}
