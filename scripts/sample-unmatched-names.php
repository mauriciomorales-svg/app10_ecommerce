<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\ProductCategorySync;

$rules = config('catalog_categories.rules', []);
$skip = config('catalog_categories.skip_name_patterns', []);

$rows = DB::table('productos as p')
    ->whereNull('p.idcategoria')
    ->whereNotExists(function ($sub) {
        $sub->selectRaw('1')->from('producto_categoria as pc')->whereColumn('pc.idproducto', 'p.idproducto');
    })
    ->orderByDesc('p.stock_actual')
    ->limit(200)
    ->get(['idproducto', 'nombre', 'stock_actual']);

echo "Sin categoria: ".$rows->count()." (muestra)\n\n";
foreach ($rows as $r) {
    if (ProductCategorySync::shouldSkipName((string) $r->nombre, $skip)) {
        continue;
    }
    if (ProductCategorySync::matchCategoryName((string) $r->nombre, $rules)) {
        continue;
    }
    echo "{$r->nombre}\n";
}
