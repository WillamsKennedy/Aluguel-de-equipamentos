<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

// Minimal bootstrap — load .env values
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

// For now return a simple health-check response.
// In production wire up a DI container (e.g. PHP-DI) and register routes.
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status'  => 'ok',
    'system'  => 'Sistema de Aluguel de Equipamentos',
    'version' => '1.0.0',
], JSON_UNESCAPED_UNICODE);
