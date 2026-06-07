<?php

declare(strict_types=1);

namespace Rental\Infrastructure\PDF;

use Rental\Domain\Client\Client;
use Rental\Domain\Equipment\Equipment;
use Rental\Domain\Reservation\Reservation;

interface ContractGeneratorInterface
{
    /**
     * Generates a PDF contract and returns the file path where it was stored.
     */
    public function generate(
        Reservation $reservation,
        Client $client,
        Equipment $equipment
    ): string;
}
