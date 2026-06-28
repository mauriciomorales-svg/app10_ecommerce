<?php

namespace App\Support;

use App\Models\CommerceStore;

final class CommerceStoreSettings
{
    public static function get(?CommerceStore $store = null): array
    {
        $store ??= CurrentCommerceStore::get();
        if ($store === null) {
            return [];
        }

        return is_array($store->settings) ? $store->settings : [];
    }

    public static function theme(?CommerceStore $store = null): string
    {
        return (string) (self::get($store)['theme'] ?? 'default');
    }

    public static function isJobshours(?CommerceStore $store = null): bool
    {
        return self::theme($store) === 'jobshours';
    }

    /**
     * @return array<string, mixed>
     */
    public static function checkout(?CommerceStore $store = null): array
    {
        return (array) (self::get($store)['checkout'] ?? []);
    }

    /**
     * @return array<string, mixed>
     */
    public static function catalog(?CommerceStore $store = null): array
    {
        return (array) (self::get($store)['catalog'] ?? []);
    }

    /**
     * Opciones de empaque: base config + digital JobsHours si aplica.
     *
     * @return array<string, array<string, mixed>>
     */
    public static function packagingOptions(?CommerceStore $store = null): array
    {
        $options = config('packaging.options', []);

        if (self::isJobshours($store)) {
            $digital = config('jobshours_shop_catalog.packaging_digital.digital', []);
            if ($digital !== []) {
                $options = ['digital' => $digital];
            }
        }

        return $options;
    }

    /**
     * @return list<string>
     */
    public static function packagingKeys(?CommerceStore $store = null): array
    {
        return array_keys(self::packagingOptions($store));
    }

    /**
     * Precio mínimo para sugerencias de carrito (0 = sin filtro).
     */
    public static function cartSuggestionMinPrice(?CommerceStore $store = null): int
    {
        if (! self::isJobshours($store)) {
            return 0;
        }

        return max(0, (int) (self::catalog($store)['suggest_min_price'] ?? 15000));
    }

    /**
     * @return list<string>
     */
    public static function cartSuggestionExcludeSkuPrefixes(?CommerceStore $store = null): array
    {
        if (! self::isJobshours($store)) {
            return [];
        }

        $prefixes = self::catalog($store)['suggest_exclude_sku_prefixes'] ?? ['JH-INT-', 'JH-HW-', 'JH-ENT-'];

        return is_array($prefixes) ? array_values(array_filter(array_map('strval', $prefixes))) : [];
    }

    public static function applyCatalogScope($query): void
    {
        $catalog = self::catalog();

        if ($catalog['hide_internal_skus'] ?? false) {
            $prefix = (string) ($catalog['internal_sku_prefix'] ?? 'JH-INT-');
            if ($prefix !== '') {
                $query->where('codigobarra', 'not like', $prefix.'%');
            }
        }

        if (\Illuminate\Support\Facades\Schema::hasTable('categoria')) {
            $hideSlugs = $catalog['hide_category_slugs'] ?? [];
            $slugToName = [
                'jh-interno' => 'Opciones internas',
                'jh-enterprise' => 'Enterprise · cotizar',
            ];
            $hideNames = [];
            if (is_array($hideSlugs)) {
                foreach ($hideSlugs as $slug) {
                    $hideNames[] = $slugToName[(string) $slug] ?? (string) $slug;
                }
            }
            $hideCategory = (string) ($catalog['hide_category_slug'] ?? 'jh-interno');
            if ($hideCategory !== '' && ! in_array($slugToName[$hideCategory] ?? $hideCategory, $hideNames, true)) {
                $hideNames[] = $slugToName[$hideCategory] ?? $hideCategory;
            }

            $catIds = \Illuminate\Support\Facades\DB::table('categoria')
                ->where(function ($q) use ($hideNames) {
                    foreach (array_unique(array_filter($hideNames)) as $name) {
                        $q->orWhere('nombre', 'like', '%'.$name.'%');
                    }
                })
                ->pluck('idcategoria')
                ->all();

            if ($catIds !== []) {
                $table = $query->getModel()->getTable();
                $query->where(function ($q) use ($catIds, $table) {
                    $q->whereNotIn($table.'.idcategoria', $catIds)
                        ->orWhereNull($table.'.idcategoria');
                });
            }
        }
    }

    /** Solo checkout: bloquea compra si venta_web = false (el catálogo sigue mostrando el producto). */
    public static function applyWebSaleScope($query): void
    {
        if (\Illuminate\Support\Facades\Schema::hasColumn('productos', 'venta_web')) {
            $query->where('venta_web', true);
        }
    }
}
