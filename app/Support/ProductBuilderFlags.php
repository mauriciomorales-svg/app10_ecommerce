<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProductBuilderFlags
{
    /**
     * Productos que deben abrir el builder (pack, bundle options, personalización o composición).
     *
     * @param  array<int>  $productIds
     * @return array<int, true>
     */
    public static function idsNeedingBuilder(array $productIds): array
    {
        $productIds = array_values(array_unique(array_filter(array_map('intval', $productIds))));
        if ($productIds === []) {
            return [];
        }

        $set = [];

        if (Schema::hasTable('product_bundle_options')) {
            foreach (DB::table('product_bundle_options')
                ->whereIn('parent_product_id', $productIds)
                ->pluck('parent_product_id') as $pid) {
                $set[(int) $pid] = true;
            }
        }

        if (Schema::hasTable('customization_fields')) {
            foreach (DB::table('customization_fields')
                ->whereIn('product_id', $productIds)
                ->pluck('product_id') as $pid) {
                $set[(int) $pid] = true;
            }
        }

        // Cross-sell (producto_sugerencias) no abre el builder; se muestra en carrito / modal aparte.

        if (Schema::hasTable('producto_composicion')) {
            foreach (DB::table('producto_composicion')
                ->whereIn('id_pack', $productIds)
                ->pluck('id_pack') as $pid) {
                $set[(int) $pid] = true;
            }
        }

        return $set;
    }

    /**
     * @param  array<int>  $productIds
     * @return array<int, true>
     */
    public static function idsWithCustomization(array $productIds): array
    {
        $productIds = array_values(array_unique(array_filter(array_map('intval', $productIds))));
        if ($productIds === [] || ! Schema::hasTable('customization_fields')) {
            return [];
        }

        $set = [];
        foreach (DB::table('customization_fields')
            ->whereIn('product_id', $productIds)
            ->pluck('product_id') as $pid) {
            $set[(int) $pid] = true;
        }

        return $set;
    }
}
