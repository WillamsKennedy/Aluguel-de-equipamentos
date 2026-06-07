<?php

declare(strict_types=1);

namespace Rental\Presentation;

final class Router
{
    /** @var array<string, array<string, callable>> method → pattern → handler */
    private array $routes = [];

    public function get(string $pattern, callable $handler): void
    {
        $this->routes['GET'][$pattern] = $handler;
    }

    public function post(string $pattern, callable $handler): void
    {
        $this->routes['POST'][$pattern] = $handler;
    }

    public function put(string $pattern, callable $handler): void
    {
        $this->routes['PUT'][$pattern] = $handler;
    }

    public function delete(string $pattern, callable $handler): void
    {
        $this->routes['DELETE'][$pattern] = $handler;
    }

    public function dispatch(string $method, string $uri): void
    {
        $method = strtoupper($method);
        $uri    = strtok($uri, '?') ?: '/';

        foreach ($this->routes[$method] ?? [] as $pattern => $handler) {
            $regex  = '#^' . preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $pattern) . '$#';
            if (preg_match($regex, $uri, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                $response = $handler($params);
                $this->sendResponse($response);
                return;
            }
        }

        $this->sendResponse(['status' => 404, 'body' => ['error' => 'Rota não encontrada']]);
    }

    private function sendResponse(array $response): void
    {
        $status = $response['status'] ?? 200;
        $body   = $response['body'] ?? [];

        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($body, JSON_UNESCAPED_UNICODE);
    }
}
