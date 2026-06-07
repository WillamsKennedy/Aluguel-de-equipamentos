<?php

declare(strict_types=1);

namespace Rental\Domain\Client;

use Rental\Domain\Client\ValueObjects\CPF;
use Rental\Domain\Client\ValueObjects\CNPJ;
use Rental\Domain\Client\ValueObjects\Email;

final class Client
{
    private bool $active = true;

    public function __construct(
        private readonly string $id,
        private readonly string $name,
        private readonly Email $email,
        private readonly string $phone,
        private readonly string $address,
        private readonly CPF|CNPJ $document
    ) {}

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getEmail(): Email
    {
        return $this->email;
    }

    public function getPhone(): string
    {
        return $this->phone;
    }

    public function getAddress(): string
    {
        return $this->address;
    }

    public function getDocument(): CPF|CNPJ
    {
        return $this->document;
    }

    public function isActive(): bool
    {
        return $this->active;
    }

    public function deactivate(): void
    {
        $this->active = false;
    }

    public function activate(): void
    {
        $this->active = true;
    }
}
