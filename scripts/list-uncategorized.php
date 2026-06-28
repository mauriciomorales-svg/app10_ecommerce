<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\ProductCategorySync;

$onlyStock = ($argv[1] ?? '') !== 'all';
$rules = config('catalog_categories.rules', []);

$q = DB::table('productos as p')
    ->select('p.idproducto', 'p.nombre', 'p.stock_actual')
    ->whereNull('p.idcategoria')
    ->whereNotExists(function ($sub) {
        $sub->selectRaw('1')->from('producto_categoria as pc')->whereColumn('pc.idproducto', 'p.idproducto');
    })
    ->orderByDesc('p.stock_actual')
    ->orderBy('p.nombre');

if ($onlyStock) {
    $q->where('p.stock_actual', '>', 0);
}

$rows = $q->limit(80)->get();
echo ($onlyStock ? 'Sin categoria (con stock)' : 'Sin categoria (todos)').': '.$q->count()."\n\n";

$matched = 0;
foreach ($rows as $r) {
    $cat = ProductCategorySync::matchCategoryName((string) $r->nombre, $rules);
    if ($cat) {
        $matched++;
    }
    echo "[{$r->idproducto}] stock={$r->stock_actual} | ".($cat ?? '?')." | {$r->nombre}\n";
}
echo "\nDe muestra 80: con regla actual={$matched}\n";
