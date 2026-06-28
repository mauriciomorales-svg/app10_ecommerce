<?php

namespace App\Services;

use App\Support\CurrentCommerceStore;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProductCategorySync
{
  /**
   * @return array{legacy_synced: int, auto_assigned: int, unchanged: int, skipped: int, no_match: int, pivot_total: int}
   */
    private static function emptyResult(): array
    {
        return [
            'legacy_synced' => 0,
            'auto_assigned' => 0,
            'unchanged' => 0,
            'skipped' => 0,
            'no_match' => 0,
            'pivot_total' => 0,
        ];
    }

    /**
     * @return array{
     *   legacy_synced: int,
     *   auto_assigned: int,
     *   unchanged: int,
     *   skipped: int,
     *   no_match: int,
     *   pivot_total: int
     * }
     */
    public static function sync(bool $onlyWithStock = true, bool $dryRun = false, bool $onlyActive = false): array
    {
        if (! Schema::hasTable('producto_categoria') || ! Schema::hasColumn('productos', 'idcategoria')) {
            return self::emptyResult();
        }

        $storeId = CurrentCommerceStore::id();
        $categoryIdsByName = DB::table('categoria')->pluck('idcategoria', 'nombre')->map(fn ($id) => (int) $id)->all();
        $rules = config('catalog_categories.rules', []);
        $skipPatterns = config('catalog_categories.skip_name_patterns', []);
        $idOverrides = config('catalog_categories.product_id_overrides', []);

        $legacySynced = 0;
        $autoAssigned = 0;
        $unchanged = 0;
        $skipped = 0;
        $noMatch = 0;

        $productsQ = DB::table('productos')->whereNotNull('idcategoria');
        if ($onlyWithStock) {
            $productsQ->where('stock_actual', '>', 0);
        }
        if ($onlyActive && Schema::hasColumn('productos', 'activo')) {
            $productsQ->where('activo', true);
        }
        if ($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id')) {
            $productsQ->where('commerce_store_id', $storeId);
        }

        foreach ($productsQ->get(['idproducto', 'idcategoria']) as $row) {
            $pid = (int) $row->idproducto;
            $cid = (int) $row->idcategoria;
            if ($cid <= 0) {
                continue;
            }
            $exists = DB::table('producto_categoria')
                ->where('idproducto', $pid)
                ->where('idcategoria', $cid)
                ->exists();
            if (! $exists) {
                if (! $dryRun) {
                    DB::table('producto_categoria')->insert([
                        'idproducto' => $pid,
                        'idcategoria' => $cid,
                    ]);
                }
                $legacySynced++;
            }
        }

        $categorizeQ = DB::table('productos as p')->select('p.idproducto', 'p.nombre', 'p.idcategoria');
        if ($onlyWithStock) {
            $categorizeQ->where('p.stock_actual', '>', 0);
        }
        if ($onlyActive && Schema::hasColumn('productos', 'activo')) {
            $categorizeQ->where('p.activo', true);
        }
        if ($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id')) {
            $categorizeQ->where('p.commerce_store_id', $storeId);
        }

        foreach ($categorizeQ->get() as $product) {
            $nombre = (string) $product->nombre;
            if (self::shouldSkipName($nombre, $skipPatterns)) {
                $skipped++;

                continue;
            }

            $pid = (int) $product->idproducto;
            $current = $product->idcategoria ? (int) $product->idcategoria : null;

            $catName = isset($idOverrides[$pid])
                ? (string) $idOverrides[$pid]
                : self::matchCategoryName($nombre, $rules);
            if ($catName === null || ! isset($categoryIdsByName[$catName])) {
                $noMatch++;

                continue;
            }

            $cid = (int) $categoryIdsByName[$catName];

            if (! $dryRun) {
                DB::table('productos')->where('idproducto', $pid)->update(['idcategoria' => $cid]);
                DB::table('producto_categoria')->where('idproducto', $pid)->delete();
                DB::table('producto_categoria')->insert([
                    'idproducto' => $pid,
                    'idcategoria' => $cid,
                ]);
            }

            if ($current === $cid) {
                $unchanged++;
            } else {
                $autoAssigned++;
            }
        }

        return [
            'legacy_synced' => $legacySynced,
            'auto_assigned' => $autoAssigned,
            'unchanged' => $unchanged,
            'skipped' => $skipped,
            'no_match' => $noMatch,
            'pivot_total' => DB::table('producto_categoria')->count(),
        ];
    }

    /**
     * @param  array<int, string>  $skipPatterns
     */
    public static function shouldSkipName(string $nombre, array $skipPatterns): bool
    {
        $lower = mb_strtolower(trim($nombre));
        foreach ($skipPatterns as $pattern) {
            if ($pattern !== '' && str_contains($lower, mb_strtolower($pattern))) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param  array<int, array{patterns: array<int, string>, categoria: string}>  $rules
     */
    public static function matchCategoryName(string $nombre, array $rules): ?string
    {
        $lower = mb_strtolower(trim($nombre));
        foreach ($rules as $rule) {
            foreach ($rule['patterns'] as $pattern) {
                if (self::nameMatchesPattern($lower, (string) $pattern)) {
                    return (string) $rule['categoria'];
                }
            }
        }

        return null;
    }

    public static function nameMatchesPattern(string $nombreLower, string $pattern): bool
    {
        $pat = mb_strtolower(trim($pattern));
        if ($pat === '') {
            return false;
        }

        if (mb_strlen($pat) < 3 && $nombreLower === $pat) {
            return true;
        }

        if (mb_strlen($pat) < 3) {
            return false;
        }

        if (mb_strlen($pat) >= 4 && str_starts_with($nombreLower, $pat)) {
            return true;
        }

        $quoted = preg_quote($pat, '/');

        return (bool) preg_match("/(^|[\\s,.\\-(\\/]){$quoted}([\\s,.\\-(\\/]|$)/iu", $nombreLower);
    }
}
