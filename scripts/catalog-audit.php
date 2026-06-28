<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== AUDITORÍA CATÁLOGO DondeMorales ===\n\n";

$total = DB::table('productos')->count();
$conStock = DB::table('productos')->where('stock_actual', '>', 0)->count();
$pivotTotal = Schema::hasTable('producto_categoria') ? DB::table('producto_categoria')->count() : 0;
$pivotConStock = DB::table('productos as p')
    ->where('p.stock_actual', '>', 0)
    ->whereExists(function ($q) {
        $q->selectRaw('1')->from('producto_categoria as pc')->whereColumn('pc.idproducto', 'p.idproducto');
    })->count();
$idcategoriaConStock = DB::table('productos')->where('stock_actual', '>', 0)->whereNotNull('idcategoria')->count();
$customFields = Schema::hasTable('customization_fields') ? DB::table('customization_fields')->count() : 0;
$bundleOpts = Schema::hasTable('product_bundle_options') ? DB::table('product_bundle_options')->count() : 0;
$packsStock = DB::table('productos')->where('es_pack', true)->where('stock_actual', '>', 0)->count();
$sugerencias = Schema::hasTable('producto_sugerencias') ? DB::table('producto_sugerencias')->where('activo', true)->count() : 0;

echo "Productos total: {$total}\n";
echo "Con stock: {$conStock}\n";
echo "Pivot producto_categoria (total): {$pivotTotal}\n";
echo "Con stock + pivot categoría: {$pivotConStock}\n";
echo "Con stock + idcategoria legacy: {$idcategoriaConStock}\n";
echo "Campos personalización: {$customFields}\n";
echo "Bundle options: {$bundleOpts}\n";
echo "Packs con stock: {$packsStock}\n";
echo "Sugerencias activas: {$sugerencias}\n\n";

echo "--- Productos con personalización ---\n";
if ($customFields > 0) {
    $rows = DB::table('customization_fields as cf')
        ->join('productos as p', 'cf.product_id', '=', 'p.idproducto')
        ->select('p.idproducto', 'p.nombre', 'p.stock_actual', DB::raw('count(cf.id) as campos'))
        ->groupBy('p.idproducto', 'p.nombre', 'p.stock_actual')
        ->orderBy('p.nombre')
        ->get();
    foreach ($rows as $r) {
        echo "  [{$r->idproducto}] {$r->nombre} (stock={$r->stock_actual}, campos={$r->campos})\n";
    }
} else {
    echo "  (ninguno)\n";
}

echo "\n--- Productos con bundle options ---\n";
if ($bundleOpts > 0) {
    $rows = DB::table('product_bundle_options as bo')
        ->join('productos as p', 'bo.parent_product_id', '=', 'p.idproducto')
        ->select('p.idproducto', 'p.nombre', 'p.stock_actual', DB::raw('count(bo.id) as opts'))
        ->groupBy('p.idproducto', 'p.nombre', 'p.stock_actual')
        ->orderBy('p.nombre')
        ->get();
    foreach ($rows as $r) {
        echo "  [{$r->idproducto}] {$r->nombre} (stock={$r->stock_actual}, opts={$r->opts})\n";
    }
} else {
    echo "  (ninguno)\n";
}

echo "\n--- Categorías (nombre → productos con stock vía pivot / legacy) ---\n";
$cats = DB::table('categoria')->orderBy('nombre')->get();
foreach ($cats as $cat) {
    $viaPivot = DB::table('producto_categoria as pc')
        ->join('productos as p', 'pc.idproducto', '=', 'p.idproducto')
        ->where('pc.idcategoria', $cat->idcategoria)
        ->where('p.stock_actual', '>', 0)
        ->count();
    $viaLegacy = DB::table('productos')
        ->where('idcategoria', $cat->idcategoria)
        ->where('stock_actual', '>', 0)
        ->count();
    if ($viaPivot > 0 || $viaLegacy > 0) {
        echo "  {$cat->nombre}: pivot={$viaPivot}, legacy={$viaLegacy}\n";
    }
}

echo "\n--- Productos con stock SIN categoría (pivot ni legacy) ---\n";
$sinCat = DB::table('productos as p')
    ->where('p.stock_actual', '>', 0)
    ->whereNull('p.idcategoria')
    ->whereNotExists(function ($q) {
        $q->selectRaw('1')->from('producto_categoria as pc')->whereColumn('pc.idproducto', 'p.idproducto');
    })
    ->select('p.idproducto', 'p.nombre', 'p.stock_actual')
    ->orderBy('p.nombre')
    ->get();
foreach ($sinCat as $p) {
    echo "  [{$p->idproducto}] {$p->nombre} (stock={$p->stock_actual})\n";
}

echo "\n--- Test sugerencias por categoría (pares config) ---\n";
$pairs = config('cart_suggestions.category_pairs', []);
foreach ($pairs as $pair) {
    $from = $pair['from'] ?? '';
    $inCart = DB::table('productos as p')
        ->join('producto_categoria as pc', 'p.idproducto', '=', 'pc.idproducto')
        ->join('categoria as c', 'pc.idcategoria', '=', 'c.idcategoria')
        ->where('c.nombre', $from)
        ->where('p.stock_actual', '>', 0)
        ->count();
    $inCartLegacy = DB::table('productos as p')
        ->join('categoria as c', 'p.idcategoria', '=', 'c.idcategoria')
        ->where('c.nombre', $from)
        ->where('p.stock_actual', '>', 0)
        ->count();
    echo "  From \"{$from}\": pivot={$inCart}, legacy={$inCartLegacy}\n";
}

echo "\n=== FIN ===\n";
