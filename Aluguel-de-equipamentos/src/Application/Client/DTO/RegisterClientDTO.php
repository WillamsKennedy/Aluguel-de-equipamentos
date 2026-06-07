<?php

declare(strict_types=1);

namespace Rental\Application\Client\DTO;

final class RegisterClientDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $email,
        public readonly string $phone,
        public readonly string $address,
        public readonly string $document,
        public readonly string $documentType  // 'cpf' | 'cnpj'
    ) {}
}
