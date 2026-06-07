<?php

declare(strict_types=1);

namespace Rental\Domain\Client\ValueObjects;

use InvalidArgumentException;

final class CPF
{
    private readonly string $value;

    public function __construct(string $cpf)
    {
        $digits = preg_replace('/\D/', '', $cpf);

        if ($digits === null || strlen($digits) !== 11) {
            throw new InvalidArgumentException("CPF deve ter 11 dígitos numéricos. Recebido: '{$cpf}'");
        }

        if (preg_match('/^(\d)\1{10}$/', $digits)) {
            throw new InvalidArgumentException("CPF inválido (todos os dígitos iguais): '{$cpf}'");
        }

        if (!self::validateDigits($digits)) {
            throw new InvalidArgumentException("CPF inválido (dígitos verificadores incorretos): '{$cpf}'");
        }

        $this->value = $digits;
    }

    private static function validateDigits(string $digits): bool
    {
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += (int)$digits[$i] * (10 - $i);
        }
        $remainder = $sum % 11;
        $first = $remainder < 2 ? 0 : 11 - $remainder;

        if ((int)$digits[9] !== $first) {
            return false;
        }

        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += (int)$digits[$i] * (11 - $i);
        }
        $remainder = $sum % 11;
        $second = $remainder < 2 ? 0 : 11 - $remainder;

        return (int)$digits[10] === $second;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getFormatted(): string
    {
        return substr($this->value, 0, 3) . '.'
            . substr($this->value, 3, 3) . '.'
            . substr($this->value, 6, 3) . '-'
            . substr($this->value, 9, 2);
    }

    public function equals(self $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
