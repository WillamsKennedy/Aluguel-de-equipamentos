<?php

declare(strict_types=1);

namespace Rental\Infrastructure\Persistence\PDO;

use PDO;
use Rental\Domain\Client\Client;
use Rental\Domain\Client\ClientRepositoryInterface;
use Rental\Domain\Client\ValueObjects\CNPJ;
use Rental\Domain\Client\ValueObjects\CPF;
use Rental\Domain\Client\ValueObjects\Email;

final class PdoClientRepository implements ClientRepositoryInterface
{
    public function __construct(private readonly PDO $pdo) {}

    public function findById(string $id): ?Client
    {
        $stmt = $this->pdo->prepare('SELECT * FROM clients WHERE id = :id LIMIT 1');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ? $this->hydrate($row) : null;
    }

    public function findByEmail(string $email): ?Client
    {
        $stmt = $this->pdo->prepare('SELECT * FROM clients WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => strtolower($email)]);
        $row = $stmt->fetch();

        return $row ? $this->hydrate($row) : null;
    }

    public function existsByEmail(string $email): bool
    {
        $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM clients WHERE email = :email');
        $stmt->execute([':email' => strtolower($email)]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function save(Client $client): void
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO clients (id, name, email, phone, address, document, doc_type, active)
             VALUES (:id, :name, :email, :phone, :address, :document, :doc_type, :active)'
        );

        $stmt->execute($this->toRow($client));
    }

    public function update(Client $client): void
    {
        $stmt = $this->pdo->prepare(
            'UPDATE clients SET name = :name, email = :email, phone = :phone,
             address = :address, document = :document, doc_type = :doc_type, active = :active
             WHERE id = :id'
        );

        $stmt->execute($this->toRow($client));
    }

    private function toRow(Client $client): array
    {
        $doc     = $client->getDocument();
        $docType = $doc instanceof CNPJ ? 'cnpj' : 'cpf';

        return [
            ':id'       => $client->getId(),
            ':name'     => $client->getName(),
            ':email'    => $client->getEmail()->getValue(),
            ':phone'    => $client->getPhone(),
            ':address'  => $client->getAddress(),
            ':document' => (string)$doc,
            ':doc_type' => $docType,
            ':active'   => $client->isActive() ? 1 : 0,
        ];
    }

    private function hydrate(array $row): Client
    {
        $document = $row['doc_type'] === 'cnpj'
            ? new CNPJ($row['document'])
            : new CPF($row['document']);

        $client = new Client(
            $row['id'],
            $row['name'],
            new Email($row['email']),
            $row['phone'],
            $row['address'],
            $document
        );

        if (!(bool)$row['active']) {
            $client->deactivate();
        }

        return $client;
    }
}
