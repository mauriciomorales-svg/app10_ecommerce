<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

class VentaEstado
{
    /** Estados que cuentan como venta cobrada / válida para métricas. */
    public const PAID = ['pagado', 'Pagado', 'activo'];

    public const PENDING = ['pendiente', 'Pendiente'];

    public const REJECTED = ['rechazado', 'Rechazado', 'anulado', 'Anulado'];

    /**
     * @return array<int, string>
     */
    public static function paidValues(): array
    {
        return self::PAID;
    }

    public static function isPaid(?string $estado): bool
    {
        if ($estado === null || $estado === '') {
            return false;
        }

        return in_array($estado, self::PAID, true);
    }

    /**
     * @param  Builder<\App\Models\Venta>  $query
     * @return Builder<\App\Models\Venta>
     */
    public static function scopePaid(Builder $query): Builder
    {
        return $query->whereIn('estado', self::PAID);
    }

    /**
     * @return array<string, string>
     */
    public static function labels(): array
    {
        return [
            'pendiente' => 'Pendiente',
            'pagado' => 'Pagado',
            'rechazado' => 'Rechazado',
            'anulado' => 'Anulado',
            'activo' => 'Activo (legacy)',
        ];
    }
}
