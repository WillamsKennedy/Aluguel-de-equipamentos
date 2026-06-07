<?php

declare(strict_types=1);

namespace Rental\Domain\Reservation\ValueObjects;

use InvalidArgumentException;

final class RentalValue
{
    public const DEPOSIT_RATE = 0.20;
    public const LATE_FEE_MULTIPLIER = 1.5;

    private readonly float $dailyRate;
    private readonly int $days;
    private readonly float $total;
    private readonly float $deposit;

    public function __construct(float $dailyRate, int $days)
    {
        if ($dailyRate <= 0) {
            throw new InvalidArgumentException(
                "Valor diário deve ser positivo. Recebido: {$dailyRate}"
            );
        }

        if ($days < 1) {
            throw new InvalidArgumentException(
                "Número de dias deve ser pelo menos 1. Recebido: {$days}"
            );
        }

        $this->dailyRate = $dailyRate;
        $this->days      = $days;
        $this->total     = round($dailyRate * $days, 2);
        $this->deposit   = round($this->total * self::DEPOSIT_RATE, 2);
    }

    public function getDailyRate(): float
    {
        return $this->dailyRate;
    }

    public function getDays(): int
    {
        return $this->days;
    }

    public function getTotal(): float
    {
        return $this->total;
    }

    public function getDeposit(): float
    {
        return $this->deposit;
    }

    /** Calcula multa por atraso: dias_excedentes × valorDiário × 1.5 */
    public function calculateLateFee(int $extraDays): float
    {
        if ($extraDays <= 0) {
            return 0.0;
        }

        return round($this->dailyRate * self::LATE_FEE_MULTIPLIER * $extraDays, 2);
    }
}
