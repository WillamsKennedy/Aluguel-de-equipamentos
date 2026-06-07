<?php

declare(strict_types=1);

namespace Rental\Domain\Equipment;

enum EquipmentStatus: string
{
    case Available    = 'disponivel';
    case Reserved     = 'reservado';
    case InMaintenance = 'em_manutencao';
    case Damaged      = 'avariado';

    public function label(): string
    {
        return match($this) {
            self::Available     => 'Disponível',
            self::Reserved      => 'Reservado',
            self::InMaintenance => 'Em Manutenção',
            self::Damaged       => 'Avariado',
        };
    }

    /** Returns all statuses reachable from this one */
    public function allowedTransitions(): array
    {
        return match($this) {
            self::Available     => [self::Reserved, self::InMaintenance, self::Damaged],
            self::Reserved      => [self::Available, self::Damaged],
            self::InMaintenance => [self::Available, self::Damaged],
            self::Damaged       => [self::InMaintenance],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }
}
