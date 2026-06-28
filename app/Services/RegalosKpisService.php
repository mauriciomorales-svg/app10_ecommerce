<?php

namespace App\Services;

use App\Models\DetalleVenta;
use App\Models\StoreSearchLog;
use App\Support\VentaEstado;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RegalosKpisService
{
    /**
     * @return array<string, mixed>
     */
    public static function summary(int $days = 7): array
    {
        $days = max(1, min($days, 90));
        $since = now()->subDays($days)->startOfDay();

        return [
            'available' => Schema::hasTable('commerce_events'),
            'period_days' => $days,
            'since' => $since->toDateString(),
            'generated_at' => now()->toIso8601String(),
            'funnel' => self::quizFunnel($since),
            'quiz_packs' => self::topQuizPacks($since),
            'quiz_ocasiones' => self::topQuizOcasiones($since),
            'upsell' => self::upsellStats($since),
            'compare' => self::compareStats($since),
            'busquedas_regalos' => self::regalosSearchStats($since),
            'visitas_regalos' => self::regalosPageViews($since),
            'ventas_packs' => self::topPackSales($since),
            'config_mas_pedidos' => (array) config('regalos_experiencia.mas_pedidos', []),
        ];
    }

    /**
     * @return array<string, int|float|null>
     */
    private static function quizFunnel(\DateTimeInterface $since): array
    {
        if (! Schema::hasTable('commerce_events')) {
            return [];
        }

        $stepsBySession = [];
        $completedSessions = [];

        $rows = DB::table('commerce_events')
            ->where('created_at', '>=', $since)
            ->whereIn('event', ['regalo_quiz_step', 'regalo_quiz_complete'])
            ->whereNotNull('session_id')
            ->orderBy('created_at')
            ->get(['event', 'session_id', 'payload']);

        foreach ($rows as $row) {
            $sid = (string) $row->session_id;
            $payload = self::decodePayload($row->payload);

            if ($row->event === 'regalo_quiz_complete') {
                $completedSessions[$sid] = true;
                continue;
            }

            $step = (int) ($payload['step'] ?? 0);
            if ($step > 0) {
                $stepsBySession[$sid] = max($stepsBySession[$sid] ?? 0, $step);
            }
        }

        $started = count($stepsBySession);
        $completed = count($completedSessions);

        $reached = static function (int $minStep) use ($stepsBySession, $completedSessions): int {
            $n = 0;
            foreach ($stepsBySession as $sid => $maxStep) {
                if ($maxStep >= $minStep || isset($completedSessions[$sid])) {
                    $n++;
                }
            }

            return $n;
        };

        $abandoned = [];
        foreach ($stepsBySession as $sid => $maxStep) {
            if (isset($completedSessions[$sid])) {
                continue;
            }
            $abandoned[$maxStep] = ($abandoned[$maxStep] ?? 0) + 1;
        }
        ksort($abandoned);

        return [
            'iniciaron' => $started,
            'pregunta_2' => $reached(2),
            'pregunta_3' => $reached(3),
            'completaron' => $completed,
            'tasa_completado' => $started > 0 ? round(100 * $completed / $started, 1) : null,
            'abandono_por_paso' => $abandoned,
        ];
    }

    /**
     * @return list<array{pack: string, veces: int}>
     */
    private static function topQuizPacks(\DateTimeInterface $since): array
    {
        return array_map(fn (array $r) => [
            'pack' => $r['label'],
            'veces' => $r['veces'],
        ], self::topPayloadField($since, 'regalo_quiz_complete', 'pack', 8));
    }

    /**
     * @return list<array{ocasion: string, veces: int}>
     */
    private static function topQuizOcasiones(\DateTimeInterface $since): array
    {
        return array_map(fn (array $r) => [
            'ocasion' => $r['label'],
            'veces' => $r['veces'],
        ], self::topPayloadField($since, 'regalo_quiz_complete', 'ocasion', 8));
    }

    /**
     * @return list<array{nombre: string, veces: int, idproducto: int|null}>
     */
    private static function upsellStats(\DateTimeInterface $since): array
    {
        if (! Schema::hasTable('commerce_events')) {
            return [];
        }

        $counts = [];
        $rows = DB::table('commerce_events')
            ->where('event', 'regalo_checkout_upsell_add')
            ->where('created_at', '>=', $since)
            ->get(['payload']);

        foreach ($rows as $row) {
            $p = self::decodePayload($row->payload);
            $nombre = (string) ($p['nombre'] ?? 'Sin nombre');
            $id = isset($p['idproducto']) ? (int) $p['idproducto'] : null;
            $key = $id ? "id:{$id}" : $nombre;
            if (! isset($counts[$key])) {
                $counts[$key] = ['nombre' => $nombre, 'veces' => 0, 'idproducto' => $id];
            }
            $counts[$key]['veces']++;
        }

        usort($counts, fn ($a, $b) => $b['veces'] <=> $a['veces']);

        return array_values(array_slice($counts, 0, 8));
    }

    /**
     * @return array{clicks: int, por_pack: list<array{nombre: string, veces: int}>}
     */
    private static function compareStats(\DateTimeInterface $since): array
    {
        $porPack = self::topPayloadField($since, 'regalo_compare_click', 'pack', 8);

        return [
            'clicks' => array_sum(array_column($porPack, 'veces')),
            'por_pack' => array_map(fn (array $r) => [
                'nombre' => $r['label'],
                'veces' => $r['veces'],
            ], $porPack),
        ];
    }

    /**
     * @return array{total: int, sin_resultado: int, top_sin_resultado: list<array{query: string, veces: int}>}
     */
    private static function regalosSearchStats(\DateTimeInterface $since): array
    {
        if (! Schema::hasTable('store_search_logs')) {
            return ['total' => 0, 'sin_resultado' => 0, 'top_sin_resultado' => []];
        }

        $base = StoreSearchLog::query()
            ->where('scope', 'regalos')
            ->where('created_at', '>=', $since);

        $total = (clone $base)->count();
        $sinResultado = (clone $base)->where('outcome', 'not_found')->count();

        $top = DB::table('store_search_logs')
            ->selectRaw('query_normalized as query, COUNT(*) as veces')
            ->where('scope', 'regalos')
            ->where('outcome', 'not_found')
            ->where('created_at', '>=', $since)
            ->groupBy('query_normalized')
            ->orderByDesc('veces')
            ->limit(8)
            ->get()
            ->map(fn ($r) => ['query' => (string) $r->query, 'veces' => (int) $r->veces])
            ->all();

        return [
            'total' => $total,
            'sin_resultado' => $sinResultado,
            'top_sin_resultado' => $top,
        ];
    }

    /**
     * @return array{page_views: int, sesiones: int}
     */
    private static function regalosPageViews(\DateTimeInterface $since): array
    {
        if (! Schema::hasTable('commerce_events')) {
            return ['page_views' => 0, 'sesiones' => 0];
        }

        $base = DB::table('commerce_events')
            ->where('event', 'page_view')
            ->where('created_at', '>=', $since)
            ->where(function ($q) {
                $q->where('page', '/regalos')
                    ->orWhere('page', 'like', '/regalos%');
            });

        return [
            'page_views' => (clone $base)->count(),
            'sesiones' => (clone $base)->whereNotNull('session_id')->distinct()->count('session_id'),
        ];
    }

    /**
     * @return list<array{nombre: string, unidades: int, monto: float, idproducto: int}>
     */
    private static function topPackSales(\DateTimeInterface $since): array
    {
        if (! Schema::hasTable('detalle_venta') || ! Schema::hasTable('venta')) {
            return [];
        }

        $query = DetalleVenta::query()
            ->join('venta', 'venta.idventa', '=', 'detalle_venta.idventa')
            ->join('productos', 'productos.idproducto', '=', 'detalle_venta.idproducto')
            ->whereIn('venta.estado', VentaEstado::paidValues())
            ->where('venta.fecha', '>=', $since)
            ->where(function ($q) {
                if (Schema::hasColumn('productos', 'es_pack')) {
                    $q->where('productos.es_pack', true);
                }
                $q->orWhere('productos.nombre', 'like', '%pack%')
                    ->orWhere('productos.nombre', 'like', '%regalo%')
                    ->orWhere('productos.nombre', 'like', '%canasta%');
            });

        $priceExpr = Schema::hasColumn('detalle_venta', 'subtotal')
            ? 'COALESCE(detalle_venta.subtotal, detalle_venta.cantidad * detalle_venta.precio_unitario)'
            : 'detalle_venta.cantidad * detalle_venta.precio_unitario';

        $rows = $query
            ->selectRaw('productos.idproducto, productos.nombre, SUM(detalle_venta.cantidad) as unidades')
            ->selectRaw("SUM({$priceExpr}) as monto")
            ->groupBy('productos.idproducto', 'productos.nombre')
            ->orderByDesc('unidades')
            ->limit(10)
            ->get();

        return $rows->map(fn ($r) => [
            'idproducto' => (int) $r->idproducto,
            'nombre' => (string) $r->nombre,
            'unidades' => (int) $r->unidades,
            'monto' => round((float) $r->monto, 0),
        ])->all();
    }

    /**
     * @return list<array{label: string, veces: int}>
     */
    private static function topPayloadField(
        \DateTimeInterface $since,
        string $event,
        string $field,
        int $limit,
    ): array {
        if (! Schema::hasTable('commerce_events')) {
            return [];
        }

        $counts = [];
        $rows = DB::table('commerce_events')
            ->where('event', $event)
            ->where('created_at', '>=', $since)
            ->get(['payload']);

        foreach ($rows as $row) {
            $p = self::decodePayload($row->payload);
            $val = trim((string) ($p[$field] ?? ''));
            if ($val === '') {
                continue;
            }
            $counts[$val] = ($counts[$val] ?? 0) + 1;
        }

        arsort($counts);
        $out = [];
        foreach (array_slice($counts, 0, $limit, true) as $label => $veces) {
            $out[] = ['label' => $label, 'veces' => $veces];
        }

        return $out;
    }

    /**
     * @return array<string, mixed>
     */
    private static function decodePayload(mixed $payload): array
    {
        if (is_array($payload)) {
            return $payload;
        }
        if (is_string($payload)) {
            $decoded = json_decode($payload, true);

            return is_array($decoded) ? $decoded : [];
        }

        return [];
    }
}
