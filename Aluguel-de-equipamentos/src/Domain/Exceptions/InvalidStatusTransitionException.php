<?php

declare(strict_types=1);

namespace Rental\Domain\Exceptions;

use RuntimeException;

final class InvalidStatusTransitionException extends RuntimeException
{
    public function __construct(string $from, string $to, string $equipmentId)
    {
        parent::__construct(
            "Transição de status inválida: '{$from}' → '{$to}'. Equipamento: '{$equipmentId}'"
        );
    }
}
