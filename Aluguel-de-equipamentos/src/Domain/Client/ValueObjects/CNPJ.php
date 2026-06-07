<?php

declare(strict_types=1);

namespace Rental\Domain\Client\ValueObjects;

use InvalidArgumentException;

final class CNPJ
{
    private readonly string $value;

    public function __construct(string $cnpj)
    {
        $digits = preg_replace('/\D/', '', $cnpj);

        if ($digits === null || strlen($digits) !== 14) {
            throw new InvalidArgumentException("CNPJ deve ter 14 dígitos numéricos. Recebido: '{$cnpj}'");
        }

        if (preg_match('/^(\d)\1{13}$/', $digits)) {
            throw new InvalidArgumentException("CNPJ inválido (todos os dígitos iguais): '{$cnpj}'");
        }

        if (!self::validateDigits($digits)) {
            throw new InvalidArgumentException("CNPJ inválido (dígitos verificadores incorretos): '{$cnpj}'");
        }

        $this->value = $digits;
    }

    private static function validateDigits(string $digits): bool
    {
        $weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $sum += (int)$digits[$i] * $weights1[$i];
        }
        $remainder = $sum % 11;
        $first = $remainder < 2 ? 0 : 11 - $remainder;

        if ((int)$digits[12] !== $first) {
            return false;
        }

        $weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        $sum = 0;
        for ($i = 0; $i < 13; $i++) {
            $sum += (int)$digits[$i] * $weights2[$i];
        }
        $remainder = $sum % 11;
        $second = $remainder < 2 ? 0 : 11 - $remainder;

        return (int)$digits[13] === $second;
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getFormatted(): string
    {
        return substr($this->value, 0, 2) . '.'
            . substr($this->value, 2, 3) . '.'
            . substr($this->value, 5, 3) . '/'
            . substr($this->value, 8, 4) . '-'
            . substr($this->value, 12, 2);
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
