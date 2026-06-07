<?php

declare(strict_types=1);

namespace Rental\Application\Client;

use Ramsey\Uuid\Uuid;
use Rental\Application\Client\DTO\RegisterClientDTO;
use Rental\Domain\Client\Client;
use Rental\Domain\Client\ClientRepositoryInterface;
use Rental\Domain\Client\ValueObjects\CNPJ;
use Rental\Domain\Client\ValueObjects\CPF;
use Rental\Domain\Client\ValueObjects\Email;
use Rental\Domain\Exceptions\DuplicateEmailException;

class RegisterClientService
{
    public function __construct(
        private readonly ClientRepositoryInterface $clientRepository
    ) {}

    public function execute(RegisterClientDTO $dto): Client
    {
        $email = new Email($dto->email);

        if ($this->clientRepository->existsByEmail($email->getValue())) {
            throw new DuplicateEmailException($email->getValue());
        }

        $document = strtolower($dto->documentType) === 'cnpj'
            ? new CNPJ($dto->document)
            : new CPF($dto->document);

        $client = new Client(
            Uuid::uuid4()->toString(),
            $dto->name,
            $email,
            $dto->phone,
            $dto->address,
            $document
        );

        $this->clientRepository->save($client);

        return $client;
    }
}
