<?php

namespace App\Services;

use App\Support\CurrentCommerceStore;
use App\Support\CommerceStoreSettings;
use App\Support\ProductBuilderFlags;
use App\Support\ProductSuggestionConfig;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CartSuggestionService
{
    /**
     * @param  array<int>  $cartProductIds
     * @return array<int, array<string, mixed>>
     */
    public static function forCart(array $cartProductIds): array
    {
        $cartIds = array_values(array_unique(array_filter(array_map('intval', $cartProductIds))));
        if ($cartIds === []) {
            return [];
        }

        $storeId = CurrentCommerceStore::id();
        $scored = [];
        $cartCategoryNames = self::cartCategoryNames($cartIds, $storeId);
        $heladoExperience = self::isHeladoExperience($cartCategoryNames, $cartIds, $storeId);

        foreach (self::suggestionsFromManualRules($cartIds, $storeId) as $row) {
            self::addScore($scored, $row, 100);
        }

        foreach (self::suggestionsFromCategoryPairs($cartIds, $storeId) as $row) {
            self::addScore($scored, $row, 60);
        }

        if ($heladoExperience) {
            foreach (self::suggestionsFromHeladoMinimarketToppings($cartIds, $storeId) as $row) {
                self::addScore($scored, $row, 85);
            }
        }

        if (! $heladoExperience) {
            foreach (self::fallbackPopular($cartIds, $storeId) as $row) {
                self::addScore($scored, $row, 20);
            }
        }

        uasort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);

        $limit = ProductSuggestionConfig::maxResults();
        $out = [];
        foreach (array_slice($scored, 0, $limit, true) as $row) {
            unset($row['score']);
            $out[] = $row;
        }

        return self::filterSuggestionsForStore($out);
    }

    /**
     * @param  array<int, array<string, mixed>>  $suggestions
     * @return array<int, array<string, mixed>>
     */
    private static function filterSuggestionsForStore(array $suggestions): array
    {
        if (! CommerceStoreSettings::isJobshours()) {
            return $suggestions;
        }

        $minPrice = CommerceStoreSettings::cartSuggestionMinPrice();
        $excludePrefixes = CommerceStoreSettings::cartSuggestionExcludeSkuPrefixes();
        $skusById = self::skusForProductIds(array_column($suggestions, 'idproducto'));

        $filtered = [];
        foreach ($suggestions as $row) {
            $precio = (float) ($row['precio_venta'] ?? 0);
            if ($minPrice > 0 && $precio < $minPrice) {
                continue;
            }
            if (empty($row['imagen_url'])) {
                continue;
            }
            $id = (int) ($row['idproducto'] ?? 0);
            $sku = $skusById[$id] ?? '';
            foreach ($excludePrefixes as $prefix) {
                if ($prefix !== '' && str_starts_with($sku, $prefix)) {
                    continue 2;
                }
            }
            $filtered[] = $row;
        }

        return $filtered;
    }

    /**
     * @param  array<int>  $productIds
     * @return array<int, string>
     */
    private static function skusForProductIds(array $productIds): array
    {
        $ids = array_values(array_filter(array_map('intval', $productIds)));
        if ($ids === [] || ! Schema::hasColumn('productos', 'codigobarra')) {
            return [];
        }

        $out = [];
        $rows = DB::table('productos')
            ->whereIn('idproducto', $ids)
            ->select('idproducto', 'codigobarra')
            ->get();
        foreach ($rows as $row) {
            $out[(int) $row->idproducto] = (string) $row->codigobarra;
        }

        return $out;
    }

    /**
     * Sugerencias para ficha de producto (manual + categoría del origen).
     *
     * @return array<int, array<string, mixed>>
     */
    public static function forProduct(int $productoId): array
    {
        return self::forCart([$productoId]);
    }

    /**
     * @return array<int, string>
     */
    private static function cartCategoryNames(array $cartIds, ?int $storeId): array
    {
        $names = [];

        if (Schema::hasTable('producto_categoria')) {
            $fromPivot = DB::table('producto_categoria as pc')
                ->join('categoria as c', 'pc.idcategoria', '=', 'c.idcategoria')
                ->whereIn('pc.idproducto', $cartIds)
                ->pluck('c.nombre');
            foreach ($fromPivot as $n) {
                $names[] = (string) $n;
            }
        }

        if (Schema::hasColumn('productos', 'idcategoria')) {
            $direct = DB::table('productos as p')
                ->join('categoria as c', 'p.idcategoria', '=', 'c.idcategoria')
                ->whereIn('p.idproducto', $cartIds)
                ->whereNotNull('p.idcategoria')
                ->when($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id'), function ($q) use ($storeId) {
                    $q->where('p.commerce_store_id', $storeId);
                })
                ->pluck('c.nombre');
            foreach ($direct as $n) {
                $names[] = (string) $n;
            }
        }

        return array_values(array_unique(array_filter($names)));
    }

    /**
     * Helados/combos: no rellenar con minimarket popular (Cachantun, etc.).
     *
     * @param  array<int, string>  $cartCategoryNames
     * @param  array<int>  $cartIds
     */
    private static function isHeladoExperience(array $cartCategoryNames, array $cartIds, ?int $storeId): bool
    {
        foreach ($cartCategoryNames as $name) {
            $n = mb_strtolower($name);
            if (str_contains($n, 'helado') || str_contains($n, 'toppi')) {
                return true;
            }
        }

        if ($cartIds === []) {
            return false;
        }

        $names = DB::table('productos as p')
            ->whereIn('p.idproducto', $cartIds)
            ->when($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id'), function ($q) use ($storeId) {
                $q->where('p.commerce_store_id', $storeId);
            })
            ->pluck('p.nombre');

        foreach ($names as $nombre) {
            $n = mb_strtolower((string) $nombre);
            if (preg_match('/(yogen|yogurt con fruta|combo|mix|helado|toppi|bomba|crunch|berry|antojo|supreme)/u', $n)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function suggestionsFromManualRules(array $cartIds, ?int $storeId): array
    {
        if (! Schema::hasTable('producto_sugerencias')) {
            return [];
        }

        $rows = DB::table('producto_sugerencias as ps')
            ->join('productos as p', 'ps.producto_sugerido_id', '=', 'p.idproducto')
            ->whereIn('ps.producto_origen_id', $cartIds)
            ->where('ps.activo', true)
            ->where('p.stock_actual', '>', 0)
            ->tap(fn ($q) => self::applyWebSaleFilter($q, 'p'))
            ->whereNotIn('ps.producto_sugerido_id', $cartIds)
            ->when($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id'), function ($q) use ($storeId) {
                $q->where('p.commerce_store_id', $storeId);
            })
            ->orderBy('ps.orden')
            ->select(
                'p.idproducto',
                'p.nombre',
                'p.precio',
                'p.stock_actual as stock',
                'p.es_pack',
                'ps.mensaje',
                'ps.tipo'
            )
            ->limit(12)
            ->get();

        return self::mapProducts($rows, 'sugerencia');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function suggestionsFromCategoryPairs(array $cartIds, ?int $storeId): array
    {
        $cartCategoryNames = self::cartCategoryNames($cartIds, $storeId);
        if ($cartCategoryNames === []) {
            return [];
        }

        $pairs = ProductSuggestionConfig::categoryPairs();
        $targetCategories = [];
        $messagesByCategory = [];

        foreach ($pairs as $pair) {
            $from = (string) ($pair['from'] ?? '');
            if ($from === '' || ! in_array($from, $cartCategoryNames, true)) {
                continue;
            }
            $msg = (string) ($pair['mensaje'] ?? 'Te puede interesar');
            foreach ((array) ($pair['suggest'] ?? []) as $catName) {
                $targetCategories[] = $catName;
                $messagesByCategory[$catName] = $msg;
            }
        }

        $targetCategories = array_values(array_unique($targetCategories));
        if ($targetCategories === []) {
            return [];
        }

        $rows = DB::table('productos as p')
            ->leftJoin('producto_categoria as pc', 'p.idproducto', '=', 'pc.idproducto')
            ->leftJoin('categoria as c_pivot', 'pc.idcategoria', '=', 'c_pivot.idcategoria')
            ->leftJoin('categoria as c_legacy', 'p.idcategoria', '=', 'c_legacy.idcategoria')
            ->where('p.stock_actual', '>', 0)
            ->where('p.precio', '>', 0)
            ->tap(fn ($q) => self::applyWebSaleFilter($q, 'p'))
            ->whereNotIn('p.idproducto', $cartIds)
            ->where(function ($qb) use ($targetCategories) {
                $qb->whereIn('c_pivot.nombre', $targetCategories)
                    ->orWhereIn('c_legacy.nombre', $targetCategories);
            })
            ->when($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id'), function ($qb) use ($storeId) {
                $qb->where('p.commerce_store_id', $storeId);
            })
            ->select(
                'p.idproducto',
                'p.nombre',
                'p.precio',
                'p.stock_actual as stock',
                DB::raw('COALESCE(c_pivot.nombre, c_legacy.nombre) as categoria_nombre'),
                'p.veces_vendido',
                'p.es_pack'
            )
            ->orderByDesc('p.veces_vendido')
            ->limit(12)
            ->get();

        $mapped = collect();
        foreach ($rows as $row) {
            $cat = (string) $row->categoria_nombre;
            $mapped->push((object) [
                'idproducto' => $row->idproducto,
                'nombre' => $row->nombre,
                'precio' => $row->precio,
                'stock' => $row->stock,
                'es_pack' => $row->es_pack ?? false,
                'mensaje' => $messagesByCategory[$cat] ?? 'Complemento ideal',
                'tipo' => 'complemento',
            ]);
        }

        return self::mapProducts($mapped, 'complemento');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function fallbackPopular(array $cartIds, ?int $storeId): array
    {
        $rows = DB::table('productos as p')
            ->where('p.stock_actual', '>', 0)
            ->where('p.precio', '>', 0)
            ->tap(fn ($q) => self::applyWebSaleFilter($q, 'p'))
            ->whereNotIn('p.idproducto', $cartIds)
            ->when($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id'), function ($qb) use ($storeId) {
                $qb->where('p.commerce_store_id', $storeId);
            })
            ->orderByDesc('p.veces_vendido')
            ->select('p.idproducto', 'p.nombre', 'p.precio', 'p.stock_actual as stock', 'p.es_pack')
            ->limit(8)
            ->get()
            ->map(fn ($r) => (object) [
                ...(array) $r,
                'mensaje' => 'Los más vendidos',
                'tipo' => 'popular',
            ]);

        return self::mapProducts($rows, 'popular');
    }

    /**
     * Golosinas del minimarket como Toppi's extra (Chubis, Tiffany, galletas…).
     * Prioriza stock con vencimiento próximo cuando existe detalle_ingreso.
     *
     * @return array<int, array<string, mixed>>
     */
    private static function suggestionsFromHeladoMinimarketToppings(array $cartIds, ?int $storeId): array
    {
        $max = max(1, (int) config('cart_suggestions.helado_minimarket_toppings.max', 4));

        return HeladosToppisDelDiaService::forCartSuggestions($cartIds, $max);
    }

    /**
     * @param  Collection<int, object>|iterable  $rows
     * @return array<int, array<string, mixed>>
     */
    private static function mapProducts($rows, string $defaultTipo): array
    {
        $ids = [];
        foreach ($rows as $row) {
            $ids[] = (int) $row->idproducto;
        }

        $imageUrls = ProductImageUrlService::urlsForIds($ids);
        $builderIds = ProductBuilderFlags::idsNeedingBuilder($ids);
        $packSavings = self::packSavingsById($ids);

        $out = [];
        foreach ($rows as $row) {
            $id = (int) $row->idproducto;
            $esPack = property_exists($row, 'es_pack') ? (bool) $row->es_pack : false;
            $item = [
                'idproducto' => $id,
                'nombre' => (string) $row->nombre,
                'precio_venta' => (float) $row->precio,
                'stock' => (int) ($row->stock ?? 0),
                'stock_disponible' => (int) ($row->stock ?? 0),
                'imagen_url' => $imageUrls[$id] ?? null,
                'mensaje' => (string) ($row->mensaje ?? 'Te puede interesar'),
                'tipo' => (string) ($row->tipo ?? $defaultTipo),
                'has_bundle_options' => isset($builderIds[$id]),
                'es_pack' => $esPack,
            ];
            if (isset($packSavings[$id]) && $packSavings[$id] > 0) {
                $item['ahorro_pack_clp'] = $packSavings[$id];
            }
            $out[] = $item;
        }

        return $out;
    }

    /**
     * @deprecated Use ProductBuilderFlags::idsNeedingBuilder()
     *
     * @param  array<int>  $productIds
     * @return array<int, true>
     */
    private static function productIdsWithBuilder(array $productIds): array
    {
        return ProductBuilderFlags::idsNeedingBuilder($productIds);
    }

    /**
     * Ahorro estimado = suma precios componentes - precio pack.
     *
     * @param  array<int>  $productIds
     * @return array<int, int>
     */
    private static function packSavingsById(array $productIds): array
    {
        if (! Schema::hasTable('producto_composicion') || $productIds === []) {
            return [];
        }

        $packs = DB::table('productos')
            ->whereIn('idproducto', $productIds)
            ->where('es_pack', true)
            ->get(['idproducto', 'precio']);

        if ($packs->isEmpty()) {
            return [];
        }

        $packIds = $packs->pluck('idproducto')->map(fn ($id) => (int) $id)->all();
        $components = DB::table('producto_composicion as pc')
            ->join('productos as c', 'pc.id_componente', '=', 'c.idproducto')
            ->whereIn('pc.id_pack', $packIds)
            ->select('pc.id_pack', 'pc.cantidad', 'c.precio')
            ->get();

        $sumByPack = [];
        foreach ($components as $line) {
            $pid = (int) $line->id_pack;
            $sumByPack[$pid] = ($sumByPack[$pid] ?? 0) + ((float) $line->precio * (int) $line->cantidad);
        }

        $out = [];
        foreach ($packs as $pack) {
            $id = (int) $pack->idproducto;
            $solo = (int) round(($sumByPack[$id] ?? 0) - (float) $pack->precio);
            if ($solo > 500) {
                $out[$id] = $solo;
            }
        }

        return $out;
    }

    /**
     * @param  array<int, array<string, mixed>>  $scored
     * @param  array<string, mixed>  $row
     */
    private static function addScore(array &$scored, array $row, int $points): void
    {
        $id = (int) $row['idproducto'];
        if (! isset($scored[$id])) {
            $row['score'] = $points;
            $row['source_priority'] = $points;
            $scored[$id] = $row;

            return;
        }

        $scored[$id]['score'] += $points;
        if ($points > ($scored[$id]['source_priority'] ?? 0)) {
            $scored[$id]['source_priority'] = $points;
            $scored[$id]['mensaje'] = $row['mensaje'];
            $scored[$id]['tipo'] = $row['tipo'];
        }
    }

    private static function applyWebSaleFilter($query, string $alias = 'productos'): void
    {
        if (! Schema::hasColumn('productos', 'venta_web')) {
            return;
        }

        $query->where("{$alias}.venta_web", true);
    }
}
