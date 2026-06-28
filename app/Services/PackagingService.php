<?php

namespace App\Services;

use App\Models\Producto;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Support\CommerceStoreSettings;

class PackagingService
{
    /**
     * @return array{key: string, label: string, amount: int, product_id: int|null, free_applied: bool}
     */
    public static function resolve(string $packagingKey, int $subtotalProductos): array
    {
        $options = CommerceStoreSettings::packagingOptions();
        if ($options === []) {
            $options = config('packaging.options', []);
        }
        if (! isset($options[$packagingKey])) {
            $packagingKey = array_key_first($options) ?? 'standard';
        }

        $opt = $options[$packagingKey];
        $amount = (int) ($opt['amount'] ?? 0);
        $freeApplied = false;

        if ($packagingKey === 'reinforced' && $subtotalProductos >= (int) config('packaging.free_reinforced_from', 10000)) {
            $amount = 0;
            $freeApplied = true;
        }
        if ($packagingKey === 'gift_box' && $subtotalProductos >= (int) config('packaging.free_gift_box_from', 25000)) {
            $amount = 0;
            $freeApplied = true;
        }

        $label = (string) ($opt['label'] ?? $packagingKey);
        if ($freeApplied) {
            $label .= ' (incluido)';
        }

        return [
            'key' => $packagingKey,
            'label' => $label,
            'amount' => $amount,
            'product_id' => self::productIdForBarcode((string) ($opt['barcode'] ?? '')),
            'free_applied' => $freeApplied,
        ];
    }

    public static function productIdForBarcode(string $barcode): ?int
    {
        if ($barcode === '') {
            return null;
        }

        $q = DB::table('productos')->where('codigobarra', $barcode)->where('activo', true);
        if (Schema::hasColumn('productos', 'commerce_store_id')) {
            $storeId = \App\Support\CurrentCommerceStore::id();
            if ($storeId !== null) {
                $q->where('commerce_store_id', $storeId);
            }
        }

        $row = $q->first(['idproducto']);

        return $row ? (int) $row->idproducto : null;
    }

    public static function publicOptions(int $subtotalProductos = 0): array
    {
        return self::publicOptionsForStore($subtotalProductos);
    }

    public static function publicOptionsForStore(int $subtotalProductos = 0): array
    {
        $out = [];
        $options = CommerceStoreSettings::packagingOptions();
        if ($options === []) {
            $options = config('packaging.options', []);
        }

        foreach ($options as $key => $opt) {
            $resolved = self::resolve($key, $subtotalProductos);
            $out[] = [
                'key' => $key,
                'label' => $opt['label'] ?? $key,
                'description' => $opt['description'] ?? '',
                'amount' => $resolved['amount'],
                'base_amount' => (int) ($opt['amount'] ?? 0),
                'recommended' => (bool) ($opt['recommended'] ?? false),
                'free_applied' => $resolved['free_applied'],
            ];
        }

        return $out;
    }
}
