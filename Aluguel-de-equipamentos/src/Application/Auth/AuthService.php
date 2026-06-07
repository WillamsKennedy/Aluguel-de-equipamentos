<?php

declare(strict_types=1);

namespace Rental\Application\Auth;

use RuntimeException;
use Rental\Domain\Client\ClientRepositoryInterface;
use Rental\Infrastructure\Clock\ClockInterface;

final class AuthService
{
    private const MAX_ATTEMPTS = 5;
    private const BCRYPT_MIN_COST = 12;

    /** @var array<string, int> email → failed attempt count */
    private array $failedAttempts = [];

    public function __construct(
        private readonly ClientRepositoryInterface $clientRepository,
        private readonly ClockInterface $clock,
        private readonly int $bcryptCost = self::BCRYPT_MIN_COST
    ) {
        if ($this->bcryptCost < self::BCRYPT_MIN_COST) {
            throw new \InvalidArgumentException(
                sprintf('Custo bcrypt mínimo é %d. Recebido: %d', self::BCRYPT_MIN_COST, $this->bcryptCost)
            );
        }
    }

    public function hashPassword(string $plainPassword): string
    {
        return password_hash($plainPassword, PASSWORD_BCRYPT, ['cost' => $this->bcryptCost]);
    }

    public function verifyPassword(string $plainPassword, string $hash): bool
    {
        return password_verify($plainPassword, $hash);
    }

    /**
     * Returns the authenticated client on success.
     * Throws RuntimeException after 5 failed attempts.
     */
    public function authenticate(string $email, string $plainPassword, string $storedHash): bool
    {
        if (($this->failedAttempts[$email] ?? 0) >= self::MAX_ATTEMPTS) {
            throw new RuntimeException(
                "Conta bloqueada após {$this->failedAttempts[$email]} tentativas falhas: '{$email}'"
            );
        }

        $valid = $this->verifyPassword($plainPassword, $storedHash);

        if (!$valid) {
            $this->failedAttempts[$email] = ($this->failedAttempts[$email] ?? 0) + 1;
            return false;
        }

        unset($this->failedAttempts[$email]);
        return true;
    }

    public function getFailedAttempts(string $email): int
    {
        return $this->failedAttempts[$email] ?? 0;
    }

    public function resetFailedAttempts(string $email): void
    {
        unset($this->failedAttempts[$email]);
    }
}
