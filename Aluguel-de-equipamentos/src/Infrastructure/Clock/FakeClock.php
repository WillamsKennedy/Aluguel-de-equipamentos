<?php

declare(strict_types=1);

namespace Rental\Infrastructure\Clock;

use DateTimeImmutable;

final class FakeClock implements ClockInterface
{
    private DateTimeImmutable $current;

    public function __construct(DateTimeImmutable $fixedTime)
    {
        $this->current = $fixedTime;
    }

    public static function at(string $datetime): self
    {
        return new self(new DateTimeImmutable($datetime));
    }

    public function now(): DateTimeImmutable
    {
        return $this->current;
    }

    public function advance(string $interval): void
    {
        $this->current = $this->current->modify($interval);
    }
}
