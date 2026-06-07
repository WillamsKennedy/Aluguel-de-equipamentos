<?php

declare(strict_types=1);

namespace Rental\Domain\Reservation;

use DateTimeImmutable;
use Rental\Domain\Exceptions\ContractNotSignedException;
use Rental\Domain\Reservation\ValueObjects\RentalPeriod;
use Rental\Domain\Reservation\ValueObjects\RentalValue;

final class Reservation
{
    private bool $contractSigned = false;
    private ?string $contractPath = null;
    private ?DateTimeImmutable $actualReturnAt = null;
    private bool $cancelled = false;
    private bool $depositRetained = false;

    public function __construct(
        private readonly string $id,
        private readonly string $clientId,
        private readonly string $equipmentId,
        private readonly RentalPeriod $period,
        private readonly RentalValue $value,
        private readonly DateTimeImmutable $createdAt
    ) {}

    public function getId(): string
    {
        return $this->id;
    }

    public function getClientId(): string
    {
        return $this->clientId;
    }

    public function getEquipmentId(): string
    {
        return $this->equipmentId;
    }

    public function getPeriod(): RentalPeriod
    {
        return $this->period;
    }

    public function getValue(): RentalValue
    {
        return $this->value;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function isContractSigned(): bool
    {
        return $this->contractSigned;
    }

    public function getContractPath(): ?string
    {
        return $this->contractPath;
    }

    public function isCancelled(): bool
    {
        return $this->cancelled;
    }

    public function isDepositRetained(): bool
    {
        return $this->depositRetained;
    }

    public function getActualReturnAt(): ?DateTimeImmutable
    {
        return $this->actualReturnAt;
    }

    public function signContract(string $contractPath): void
    {
        $this->contractSigned = true;
        $this->contractPath   = $contractPath;
    }

    public function confirmPickup(): void
    {
        if (!$this->contractSigned) {
            throw new ContractNotSignedException($this->id);
        }
    }

    public function cancel(bool $retainDeposit): void
    {
        $this->cancelled       = true;
        $this->depositRetained = $retainDeposit;
    }

    public function registerReturn(DateTimeImmutable $returnedAt): void
    {
        $this->actualReturnAt = $returnedAt;
    }

    /** Returns extra days beyond the contracted end date (>2h grace period). */
    public function calculateExtraDays(DateTimeImmutable $actualReturn): int
    {
        $gracePeriodSeconds = 2 * 3600;
        $endTimestamp       = $this->period->getEndDate()->getTimestamp();
        $returnTimestamp    = $actualReturn->getTimestamp();

        $overdue = $returnTimestamp - $endTimestamp;

        if ($overdue <= $gracePeriodSeconds) {
            return 0;
        }

        return (int)ceil(($overdue - $gracePeriodSeconds) / 86400);
    }
}
