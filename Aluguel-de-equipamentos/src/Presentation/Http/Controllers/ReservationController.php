<?php

declare(strict_types=1);

namespace Rental\Presentation\Http\Controllers;

use DateTimeImmutable;
use Exception;
use Rental\Application\Contract\GenerateContractService;
use Rental\Application\Reservation\CancelReservationService;
use Rental\Application\Reservation\CreateReservationService;
use Rental\Application\Reservation\ProcessReturnService;
use Rental\Domain\Exceptions\InactiveClientException;
use Rental\Domain\Exceptions\InvalidRentalPeriodException;
use Rental\Domain\Exceptions\OverlappingReservationException;
use Rental\Domain\Exceptions\UnavailableEquipmentException;
use Rental\Domain\Reservation\ReturnChecklist;

final class ReservationController
{
    public function __construct(
        private readonly CreateReservationService $createService,
        private readonly CancelReservationService $cancelService,
        private readonly ProcessReturnService $returnService,
        private readonly GenerateContractService $contractService
    ) {}

    public function create(array $data): array
    {
        try {
            $reservation = $this->createService->execute(
                $data['clientId']    ?? '',
                $data['equipmentId'] ?? '',
                new DateTimeImmutable($data['startDate'] ?? 'now'),
                new DateTimeImmutable($data['endDate']   ?? 'now')
            );

            return [
                'status' => 201,
                'body'   => [
                    'id'        => $reservation->getId(),
                    'total'     => $reservation->getValue()->getTotal(),
                    'deposit'   => $reservation->getValue()->getDeposit(),
                    'days'      => $reservation->getValue()->getDays(),
                ],
            ];
        } catch (InactiveClientException $e) {
            return ['status' => 403, 'body' => ['error' => $e->getMessage()]];
        } catch (UnavailableEquipmentException | OverlappingReservationException $e) {
            return ['status' => 409, 'body' => ['error' => $e->getMessage()]];
        } catch (InvalidRentalPeriodException $e) {
            return ['status' => 422, 'body' => ['error' => $e->getMessage()]];
        } catch (Exception $e) {
            return ['status' => 400, 'body' => ['error' => $e->getMessage()]];
        }
    }

    public function cancel(array $params, array $data): array
    {
        try {
            $retained = $this->cancelService->execute(
                $params['id'] ?? '',
                $data['userId'] ?? ''
            );

            return [
                'status' => 200,
                'body'   => [
                    'cancelled'       => true,
                    'depositRetained' => $retained,
                    'message'         => $retained
                        ? 'Reserva cancelada. Caução retida por cancelamento tardio.'
                        : 'Reserva cancelada. Caução será devolvida.',
                ],
            ];
        } catch (Exception $e) {
            return ['status' => 400, 'body' => ['error' => $e->getMessage()]];
        }
    }

    public function processReturn(array $params, array $data): array
    {
        try {
            $checklist = new ReturnChecklist();
            foreach ($data['checklist'] ?? [] as $item) {
                $checklist->addItem($item['name'], (bool)$item['ok'], $item['notes'] ?? null);
            }

            $result = $this->returnService->execute(
                $params['id'] ?? '',
                $checklist,
                $data['userId'] ?? ''
            );

            return ['status' => 200, 'body' => $result];
        } catch (Exception $e) {
            return ['status' => 400, 'body' => ['error' => $e->getMessage()]];
        }
    }

    public function generateContract(array $params): array
    {
        try {
            $path = $this->contractService->execute($params['id'] ?? '');
            return ['status' => 200, 'body' => ['contractPath' => $path]];
        } catch (Exception $e) {
            return ['status' => 400, 'body' => ['error' => $e->getMessage()]];
        }
    }
}
