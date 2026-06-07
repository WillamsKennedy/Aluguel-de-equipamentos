<?php

declare(strict_types=1);

namespace Rental\Domain\Client;

interface ClientRepositoryInterface
{
    public function findById(string $id): ?Client;

    public function findByEmail(string $email): ?Client;

    public function save(Client $client): void;

    public function update(Client $client): void;

    public function existsByEmail(string $email): bool;
}
