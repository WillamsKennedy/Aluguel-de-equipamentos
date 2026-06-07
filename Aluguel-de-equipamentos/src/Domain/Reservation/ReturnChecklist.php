<?php

declare(strict_types=1);

namespace Rental\Domain\Reservation;

final class ReturnChecklist
{
    /** @var array<string, array{ok: bool, notes: string|null}> */
    private array $items = [];
    private bool $hasDamage = false;

    public function addItem(string $item, bool $ok, ?string $notes = null): void
    {
        $this->items[$item] = ['ok' => $ok, 'notes' => $notes];

        if (!$ok) {
            $this->hasDamage = true;
        }
    }

    public function hasDamage(): bool
    {
        return $this->hasDamage;
    }

    public function getItems(): array
    {
        return $this->items;
    }
}
