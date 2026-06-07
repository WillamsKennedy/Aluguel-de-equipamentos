<?php

declare(strict_types=1);

namespace Rental\Domain\Exceptions;

use RuntimeException;

final class UnavailableEquipmentException extends RuntimeException
{
    public function __construct(string $equipmentId, string $currentStatus)
    {
        parent::__construct(
            "Equipamento não está disponível para reserva. ID: '{$equipmentId}', Status atual: '{$currentStatus}'"
        );
    }
}
