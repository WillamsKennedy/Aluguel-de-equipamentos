<?php

declare(strict_types=1);

namespace Rental\Domain\Exceptions;

use RuntimeException;

final class ContractNotSignedException extends RuntimeException
{
    public function __construct(string $reservationId)
    {
        parent::__construct(
            "Retirada bloqueada: contrato não assinado. Reserva: '{$reservationId}'"
        );
    }
}
