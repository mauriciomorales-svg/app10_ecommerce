<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\ProductCategorySync;

$rules = config('catalog_categories.rules', []);
$total = DB::table('productos')->count();
$withStock = DB::table('productos')->where('stock_actual', '>', 0)->count();

$hasCat = DB::table('productos as p')
    ->where(function ($q) {
        $q->whereNotNull('p.idcategoria')
            ->orWhereExists(function ($sub) {
                $sub->selectRaw('1')->from('producto_categoria as pc')->whereColumn('pc.idproducto', 'p.idproducto');
            });
    });

$catCount = (clone $hasCat)->count();
$catStock = (clone $hasCat)->where('p.stock_actual', '>', 0)->count();

echo "Total productos: {$total}\n";
echo "Con stock: {$withStock}\n";
echo "Con categoria (cualquier): {$catCount}\n";
echo "Con categoria y stock: {$catStock}\n";
echo "Sin categoria: ".($total - $catCount)."\n\n";

echo "Por categoria (productos con idcategoria o pivot):\n";
$cats = DB::table('categoria')->orderBy('nombre')->get();
foreach ($cats as $cat) {
    $viaLegacy = DB::table('productos')->where('idcategoria', $cat->idcategoria)->count();
    $viaPivot = DB::table('producto_categoria')->where('idcategoria', $cat->idcategoria)->count();
    echo "  {$cat->nombre}: legacy={$viaLegacy} pivot={$viaPivot}\n";
}

// Simular match sin guardar
$uncat = DB::table('productos as p')
    ->whereNull('p.idcategoria')
    ->whereNotExists(function ($sub) {
        $sub->selectRaw('1')->from('producto_categoria as pc')->whereColumn('pc.idproducto', 'p.idproducto');
    })
    ->pluck('nombre', 'idproducto');

$wouldMatch = 0;
$stillMiss = 0;
foreach ($uncat as $id => $nombre) {
    if (ProductCategorySync::matchCategoryName((string) $nombre, $rules)) {
        $wouldMatch++;
    } else {
        $stillMiss++;
    }
}
echo "\nSin categoria ahora: ".$uncat->count()."\n";
echo "Cubiertos por reglas actuales (simulacion): {$wouldMatch}\n";
echo "Quedarian sin match: {$stillMiss}\n";
