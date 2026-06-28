<?php

namespace App\Services;

use App\Support\CurrentCommerceStore;
use App\Support\ProductBuilderFlags;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Golosinas minimarket aptas como Toppi's extra — prioriza vencimiento próximo (FEFO).
 */
class HeladosToppisDelDiaService
{
    /**
     * @return array<string, mixed>
     */
    public static function config(): array
    {
        $negocio = (array) config('toppis_helados_negocio.minimarket_toppings', []);
        $delDia = (array) config('toppis_helados_negocio.toppis_del_dia', []);

        return array_merge($negocio, $delDia);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function items(int $limit = 3, array $excludeProductIds = []): array
    {
        $cfg = self::config();
        if (! ($cfg['activo'] ?? true)) {
            return [];
        }

        $patterns = (array) ($cfg['patrones_nombre'] ?? $cfg['patrones'] ?? []);
        if ($patterns === []) {
            return [];
        }

        $categories = (array) ($cfg['categorias_buscar'] ?? $cfg['categorias'] ?? ['Snacks y Golosinas']);
        $max = max(1, $limit > 0 ? $limit : (int) ($cfg['max_items'] ?? 3));
        $diasExpiry = max(1, (int) ($cfg['dias_vencimiento_priorizar'] ?? 14));
        $expiryBefore = now()->addDays($diasExpiry)->toDateString();
        $storeId = CurrentCommerceStore::id();
        $exclude = array_values(array_unique(array_filter(array_map('intval', $excludeProductIds))));

        $query = DB::table('productos as p')
            ->leftJoin('producto_categoria as pc', 'p.idproducto', '=', 'pc.idproducto')
            ->leftJoin('categoria as c_pivot', 'pc.idcategoria', '=', 'c_pivot.idcategoria')
            ->leftJoin('categoria as c_legacy', 'p.idcategoria', '=', 'c_legacy.idcategoria')
            ->where('p.stock_actual', '>', 0)
            ->where('p.precio', '>', 0)
            ->when($exclude !== [], fn ($q) => $q->whereNotIn('p.idproducto', $exclude))
            ->where(function ($qb) use ($categories) {
                $qb->whereIn('c_pivot.nombre', $categories)
                    ->orWhereIn('c_legacy.nombre', $categories);
            })
            ->where(function ($qb) use ($patterns) {
                foreach ($patterns as $pat) {
                    $pat = trim((string) $pat);
                    if ($pat !== '') {
                        $qb->orWhere('p.nombre', 'like', '%'.$pat.'%');
                    }
                }
            })
            ->when($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id'), function ($qb) use ($storeId) {
                $qb->where('p.commerce_store_id', $storeId);
            });

        $hasExpiry = Schema::hasTable('detalle_ingreso')
            && Schema::hasColumn('detalle_ingreso', 'fecha_vencimiento');

        if ($hasExpiry) {
            $query->leftJoin('detalle_ingreso as di', function ($join) {
                $join->on('di.idproducto', '=', 'p.idproducto')
                    ->where('di.stock_actual', '>', 0);
            })
                ->select(
                    'p.idproducto',
                    'p.nombre',
                    'p.precio',
                    'p.stock_actual as stock',
                    DB::raw('MIN(di.fecha_vencimiento) as proximo_vencimiento')
                )
                ->groupBy('p.idproducto', 'p.nombre', 'p.precio', 'p.stock_actual')
                ->orderByRaw('CASE WHEN MIN(di.fecha_vencimiento) IS NULL THEN 1 ELSE 0 END')
                ->orderBy('proximo_vencimiento')
                ->orderByDesc('p.veces_vendido');
        } else {
            $query->select(
                'p.idproducto',
                'p.nombre',
                'p.precio',
                'p.stock_actual as stock'
            )
                ->orderByDesc('p.veces_vendido');
        }

        $rows = $query->limit($max * 2)->get();
        $ids = $rows->pluck('idproducto')->map(fn ($id) => (int) $id)->all();
        $imageUrls = ProductImageUrlService::urlsForIds($ids);
        $scriptTpl = (string) ($cfg['script_cajero'] ?? '¿Coronamos con {nombre}? Ideal antes del {fecha}.');

        $out = [];
        foreach ($rows as $row) {
            if (count($out) >= $max) {
                break;
            }
            $id = (int) $row->idproducto;
            $expiry = $hasExpiry && property_exists($row, 'proximo_vencimiento') ? $row->proximo_vencimiento : null;
            $expiryStr = $expiry ? (string) $expiry : null;
            $nearExpiry = $expiryStr && $expiryStr <= $expiryBefore;
            $diasRestantes = null;
            if ($expiryStr) {
                $diasRestantes = (int) now()->startOfDay()->diffInDays(\Carbon\Carbon::parse($expiryStr)->startOfDay(), false);
            }

            $fechaLabel = $expiryStr
                ? \Carbon\Carbon::parse($expiryStr)->locale('es')->isoFormat('D MMM')
                : 'pronto';

            $out[] = [
                'idproducto' => $id,
                'nombre' => (string) $row->nombre,
                'precio_venta' => (int) round((float) $row->precio),
                'stock' => (int) ($row->stock ?? 0),
                'imagen_url' => $imageUrls[$id] ?? null,
                'proximo_vencimiento' => $expiryStr,
                'dias_restantes' => $diasRestantes,
                'vencimiento_proximo' => $nearExpiry,
                'script_cajero' => str_replace(
                    ['{nombre}', '{fecha}', '{precio}'],
                    [(string) $row->nombre, $fechaLabel, '$'.number_format((float) $row->precio, 0, ',', '.')],
                    $scriptTpl
                ),
            ];
        }

        return $out;
    }

    /**
     * Bloque API para web / mostrador.
     *
     * @return array<string, mixed>
     */
    public static function block(): array
    {
        $cfg = self::config();
        $max = (int) ($cfg['max_items'] ?? 3);

        return [
            'titulo' => (string) ($cfg['titulo'] ?? 'Toppi\'s del día'),
            'subtitulo' => (string) ($cfg['subtitulo'] ?? 'Golosinas del minimarket — córtalas y coroná el helado'),
            'actualizado' => now()->toIso8601String(),
            'items' => self::items($max),
        ];
    }

    /**
     * Formato sugerencias carrito / builder.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function forCartSuggestions(array $cartIds, int $max = 4): array
    {
        $items = self::items($max, $cartIds);
        $msgDefault = (string) config(
            'toppis_helados_negocio.minimarket_toppings.mensaje_sugerencia',
            'Corónalo — golosina del minimarket como Toppi\'s extra'
        );
        $msgExpiry = (string) config(
            'toppis_helados_negocio.minimarket_toppings.mensaje_vencimiento_proximo',
            'Hoy en topping — aprovecha antes que se vaya'
        );

        $ids = array_column($items, 'idproducto');
        $builderIds = ProductBuilderFlags::idsNeedingBuilder($ids);

        $out = [];
        foreach ($items as $item) {
            $id = (int) $item['idproducto'];
            $out[] = [
                'idproducto' => $id,
                'nombre' => $item['nombre'],
                'precio_venta' => (float) $item['precio_venta'],
                'stock' => $item['stock'],
                'stock_disponible' => $item['stock'],
                'imagen_url' => $item['imagen_url'],
                'mensaje' => ($item['vencimiento_proximo'] ?? false) ? $msgExpiry : $msgDefault,
                'tipo' => 'topping_minimarket',
                'has_bundle_options' => isset($builderIds[$id]),
                'es_pack' => false,
            ];
        }

        return $out;
    }
}
