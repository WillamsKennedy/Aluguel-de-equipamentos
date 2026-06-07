<?php

declare(strict_types=1);

namespace Rental\Domain\Reservation\ValueObjects;

use DateTimeImmutable;
use Rental\Domain\Exceptions\InvalidRentalPeriodException;

final class RentalPeriod
{
    public const MIN_DAYS = 1;
    public const MAX_DAYS = 30;

    private readonly DateTimeImmutable $startDate;
    private readonly DateTimeImmutable $endDate;
    private readonly int $days;

    public function __construct(DateTimeImmutable $startDate, DateTimeImmutable $endDate)
    {
        $start = $startDate->setTime(0, 0, 0);
        $end   = $endDate->setTime(0, 0, 0);

        if ($end <= $start) {
            throw new InvalidRentalPeriodException(
                $startDate,
                $endDate,
                'A data de término deve ser posterior à data de início.'
            );
        }

        $days = (int)$start->diff($end)->days;

        if ($days < self::MIN_DAYS) {
            throw new InvalidRentalPeriodException(
                $startDate,
                $endDate,
                sprintf('O período mínimo é de %d dia.', self::MIN_DAYS)
            );
        }

        if ($days > self::MAX_DAYS) {
            throw new InvalidRentalPeriodException(
                $startDate,
                $endDate,
                sprintf('O período máximo é de %d dias. Solicitado: %d dias.', self::MAX_DAYS, $days)
            );
        }

        $this->startDate = $start;
        $this->endDate   = $end;
        $this->days      = $days;
    }

    public function getStartDate(): DateTimeImmutable
    {
        return $this->startDate;
    }

    public function getEndDate(): DateTimeImmutable
    {
        return $this->endDate;
    }

    public function getDays(): int
    {
        return $this->days;
    }

    public function overlaps(self $other): bool
    {
        return $this->startDate < $other->endDate
            && $this->endDate > $other->startDate;
    }

    public function hoursUntilStart(DateTimeImmutable $from): float
    {
        $diff = $this->startDate->getTimestamp() - $from->getTimestamp();
        return $diff / 3600;
    }
}
