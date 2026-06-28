<?php

namespace App\Services;

use App\Models\Producto;

class RegaloPackDeliveryService
{
    /**
     * Envío gratis cuando el carrito es solo packs regalo cerrados (perfil regalo).
     *
     * @param  array<int>  $productIds
     */
    public static function productIdsQualifyForFreeDelivery(array $productIds): bool
    {
        $ids = array_values(array_filter(array_map('intval', $productIds)));
        if ($ids === []) {
            return false;
        }

        $productos = Producto::query()
            ->whereIn('idproducto', $ids)
            ->get(['idproducto', 'es_pack', 'builder_profile']);

        if ($productos->count() !== count($ids)) {
            return false;
        }

        foreach ($productos as $producto) {
            if (! $producto->es_pack || (string) ($producto->builder_profile ?? '') !== 'regalo') {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array<int, array<string, mixed>>  $resolvedItems
     */
    public static function resolvedItemsQualifyForFreeDelivery(array $resolvedItems): bool
    {
        $ids = array_map(fn (array $row) => (int) ($row['idproducto'] ?? 0), $resolvedItems);

        return self::productIdsQualifyForFreeDelivery($ids);
    }
}
