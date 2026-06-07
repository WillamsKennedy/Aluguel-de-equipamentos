<?php

declare(strict_types=1);

namespace Rental\Infrastructure\Payment;

final class MockPaymentGateway implements PaymentGatewayInterface
{
    private array $charged = [];
    private bool $shouldFail;

    public function __construct(bool $shouldFail = false)
    {
        $this->shouldFail = $shouldFail;
    }

    public function charge(
        string $paymentToken,
        float $amount,
        string $method,
        string $description
    ): array {
        // PCI-DSS: raw card data must never be stored — only tokens
        $this->assertNoRawCardData($paymentToken);

        if ($this->shouldFail) {
            return ['success' => false, 'gatewayReference' => '', 'message' => 'Pagamento recusado (mock)'];
        }

        $reference = 'MOCK-' . strtoupper(bin2hex(random_bytes(6)));

        $this->charged[] = [
            'token'     => $paymentToken,
            'amount'    => $amount,
            'method'    => $method,
            'reference' => $reference,
        ];

        return ['success' => true, 'gatewayReference' => $reference, 'message' => 'Aprovado'];
    }

    public function getChargedTransactions(): array
    {
        return $this->charged;
    }

    /** Ensures no raw card number is accidentally passed as token. */
    private function assertNoRawCardData(string $token): void
    {
        if (preg_match('/^\d{13,19}$/', preg_replace('/\s/', '', $token))) {
            throw new \RuntimeException(
                'VIOLAÇÃO PCI-DSS: número de cartão bruto detectado. Use apenas tokens do gateway.'
            );
        }
    }
}
