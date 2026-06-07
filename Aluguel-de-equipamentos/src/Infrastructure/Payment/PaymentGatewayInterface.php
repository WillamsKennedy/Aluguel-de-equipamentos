<?php

declare(strict_types=1);

namespace Rental\Infrastructure\Payment;

interface PaymentGatewayInterface
{
    /**
     * Processes a payment tokenized by the gateway.
     * NEVER passes raw card data — only tokens provided by the gateway SDK.
     *
     * @return array{success: bool, gatewayReference: string, message: string}
     */
    public function charge(
        string $paymentToken,
        float $amount,
        string $method,
        string $description
    ): array;
}
