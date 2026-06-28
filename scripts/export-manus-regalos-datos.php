<?php
/**
 * Exporta CSV/JSON para adjuntar a Manus (informe regalos/packs).
 *
 *   php scripts/export-manus-regalos-datos.php
 *
 * Salida: storage/app/manus-export/
 */
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$outDir = __DIR__.'/../storage/app/manus-export';
@mkdir($outDir, 0755, true);

function writeCsv(string $path, array $headers, array $rows): int
{
    $fp = fopen($path, 'w');
    if ($fp === false) {
        throw new RuntimeException("No se pudo escribir {$path}");
    }
    fputcsv($fp, $headers);
    foreach ($rows as $row) {
        fputcsv($fp, $row);
    }
    fclose($fp);

    return count($rows);
}

$dateCol = Schema::hasColumn('detalle_venta', 'created_at') ? 'created_at' : null;

echo "=== export-manus-regalos-datos ===\n";

$ventas = DB::table('productos as p')
    ->leftJoin('detalle_venta as dv', 'dv.idproducto', '=', 'p.idproducto')
    ->leftJoin('producto_categoria as pc', 'pc.idproducto', '=', 'p.idproducto')
    ->leftJoin('categoria as c', 'c.idcategoria', '=', 'pc.idcategoria')
    ->where('p.activo', true)
    ->where(function ($q) {
        $q->where('c.nombre', 'like', '%regalo%')
            ->orWhere('p.nombre', 'like', '%pack%')
            ->orWhere('p.nombre', 'like', '%canasta%')
            ->orWhere('p.nombre', 'like', '%regalo%')
            ->orWhere('p.nombre', 'like', '%combo%')
            ->orWhere('p.nombre', 'like', '%helado%')
            ->orWhere('p.nombre', 'like', '%chorrillana%');
    })
    ->when($dateCol, fn ($q) => $q->where(function ($q2) use ($dateCol) {
        $q2->whereNull('dv.'.$dateCol)->orWhere('dv.'.$dateCol, '>', now()->subYear());
    }))
    ->groupBy('p.idproducto', 'p.nombre', 'p.precio', 'p.precio_costo', 'p.stock_actual', 'p.es_pack', 'p.venta_web')
    ->orderByRaw('COALESCE(SUM(dv.cantidad), 0) DESC')
    ->limit(200)
    ->get([
        'p.idproducto', 'p.nombre', 'p.precio', 'p.precio_costo', 'p.stock_actual', 'p.es_pack', 'p.venta_web',
        DB::raw('COALESCE(SUM(dv.cantidad), 0) as unidades_vendidas'),
        DB::raw('COALESCE(SUM(dv.cantidad * dv.precio_unitario), 0) as ingreso_clp'),
    ]);

$n1 = writeCsv(
    "{$outDir}/ventas_regalo_pack_12m.csv",
    ['idproducto', 'nombre', 'precio', 'precio_costo', 'stock_actual', 'es_pack', 'venta_web', 'unidades_vendidas', 'ingreso_clp'],
    $ventas->map(fn ($r) => [
        $r->idproducto, $r->nombre, $r->precio, $r->precio_costo, $r->stock_actual,
        $r->es_pack ? '1' : '0', ($r->venta_web ?? false) ? '1' : '0',
        $r->unidades_vendidas, $r->ingreso_clp,
    ])->all()
);
echo "ventas_regalo_pack_12m.csv: {$n1} filas\n";

$sinVentas = DB::table('productos as p')
    ->where('p.activo', true)
    ->where('p.es_pack', false)
    ->where('p.stock_actual', '>', 5)
    ->whereNotExists(function ($q) use ($dateCol) {
        $q->select(DB::raw('1'))
            ->from('detalle_venta as dv')
            ->whereColumn('dv.idproducto', 'p.idproducto');
        if ($dateCol) {
            $q->where('dv.'.$dateCol, '>', now()->subDays(90));
        }
    })
    ->orderByDesc('p.stock_actual')
    ->limit(100)
    ->get(['p.idproducto', 'p.nombre', 'p.precio', 'p.stock_actual', 'p.precio_costo']);

$n2 = writeCsv(
    "{$outDir}/stock_sin_venta_90d.csv",
    ['idproducto', 'nombre', 'precio', 'stock_actual', 'precio_costo'],
    $sinVentas->map(fn ($r) => [$r->idproducto, $r->nombre, $r->precio, $r->stock_actual, $r->precio_costo])->all()
);
echo "stock_sin_venta_90d.csv: {$n2} filas\n";

$packsRows = [];
foreach ((array) config('packs_reserva.secciones', []) as $sec) {
    foreach ((array) ($sec['items'] ?? []) as $item) {
        $nombre = (string) ($item['nombre'] ?? '');
        $p = DB::table('productos')->where('nombre', $nombre)->where('activo', true)->orderByDesc('idproducto')->first();
        $packsRows[] = [
            $sec['id'] ?? '',
            $nombre,
            $item['nombre_publico'] ?? '',
            $p->idproducto ?? '',
            $p->precio ?? '',
            $p->stock_actual ?? '',
            ($p->venta_web ?? false) ? '1' : '0',
        ];
    }
}

$n3 = writeCsv(
    "{$outDir}/packs_reserva_web.csv",
    ['seccion', 'nombre_bd', 'nombre_publico', 'idproducto', 'precio', 'stock', 'venta_web'],
    $packsRows
);
echo "packs_reserva_web.csv: {$n3} filas\n";

$cerrados = array_map(fn ($p) => [
    'nombre' => $p['nombre'] ?? '',
    'precio' => $p['precio'] ?? null,
    'modalidad' => $p['modalidad_label'] ?? '',
    'incluye' => $p['siempre_incluye_texto'] ?? [],
], array_values((array) config('packs_regalo_cerrados.packs', [])));

file_put_contents("{$outDir}/packs_cerrados_resumen.json", json_encode($cerrados, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

$readme = <<<'MD'
# Export Manus — DondeMorales

Adjuntar a Manus junto con `inventario-api/docs/PROMPT-MANUS-REGALOS-COMPETENCIA-2026.md`

| Archivo | Contenido |
|---------|-----------|
| ventas_regalo_pack_12m.csv | Ventas 12 meses regalo/pack/helado/comida |
| stock_sin_venta_90d.csv | Componentes con stock y sin venta reciente |
| packs_reserva_web.csv | Catálogo actual /packs |
| packs_cerrados_resumen.json | Packs cerrados configurados |

Perspectiva agente: inventario-api/docs/PERSPECTIVA-AGENTE-PACKS-MANUS-2026.md
MD;

file_put_contents("{$outDir}/README.md", $readme);

echo "Listo → {$outDir}\n";
