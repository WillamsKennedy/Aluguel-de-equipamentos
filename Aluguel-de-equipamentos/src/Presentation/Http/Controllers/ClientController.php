<?php

declare(strict_types=1);

namespace Rental\Presentation\Http\Controllers;

use InvalidArgumentException;
use Rental\Application\Client\DTO\RegisterClientDTO;
use Rental\Application\Client\RegisterClientService;
use Rental\Domain\Client\ValueObjects\CNPJ;
use Rental\Domain\Client\ValueObjects\CPF;
use Rental\Domain\Exceptions\DuplicateEmailException;

final class ClientController
{
    public function __construct(
        private readonly RegisterClientService $registerService
    ) {}

    public function register(array $data): array
    {
        try {
            $documentType = $data['documentType'] ?? 'cpf';
            $document     = $data['document'] ?? '';

            // Validate document at the boundary before reaching the service
            if (strtolower($documentType) === 'cnpj') {
                new CNPJ($document);
            } else {
                new CPF($document);
            }

            $dto = new RegisterClientDTO(
                $data['name']         ?? '',
                $data['email']        ?? '',
                $data['phone']        ?? '',
                $data['address']      ?? '',
                $document,
                $documentType
            );

            $client = $this->registerService->execute($dto);

            return [
                'status' => 201,
                'body'   => [
                    'id'    => $client->getId(),
                    'name'  => $client->getName(),
                    'email' => $client->getEmail()->getValue(),
                ],
            ];
        } catch (DuplicateEmailException $e) {
            return ['status' => 409, 'body' => ['error' => $e->getMessage()]];
        } catch (InvalidArgumentException $e) {
            return ['status' => 422, 'body' => ['error' => $e->getMessage()]];
        }
    }
}
