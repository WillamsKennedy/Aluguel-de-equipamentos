<?php

declare(strict_types=1);

namespace Rental\Domain\Exceptions;

use RuntimeException;

final class InactiveClientException extends RuntimeException
{
    public function __construct(string $clientId, string $clientName)
    {
        parent::__construct(
            "Cliente inadimplente não pode realizar reservas. ID: '{$clientId}', Nome: '{$clientName}'"
        );
    }
}
