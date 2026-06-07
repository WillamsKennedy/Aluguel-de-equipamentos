<?php

declare(strict_types=1);

namespace Rental\Domain\Exceptions;

use DateTimeImmutable;
use RuntimeException;

final class InvalidRentalPeriodException extends RuntimeException
{
    public function __construct(
        private readonly DateTimeImmutable $startDate,
        private readonly DateTimeImmutable $endDate,
        string $reason
    ) {
        parent::__construct(
            sprintf(
                'Período de aluguel inválido (%s → %s): %s',
                $startDate->format('Y-m-d'),
                $endDate->format('Y-m-d'),
                $reason
            )
        );
    }

    public function getStartDate(): DateTimeImmutable
    {
        return $this->startDate;
    }

    public function getEndDate(): DateTimeImmutable
    {
        return $this->endDate;
    }
}
