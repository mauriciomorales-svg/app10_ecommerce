<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$fixed = 0;
$products = DB::table('productos')
    ->where('stock_actual', '>', 0)
    ->whereNotNull('idcategoria')
    ->get(['idproducto', 'idcategoria']);

foreach ($products as $p) {
    $pid = (int) $p->idproducto;
    $cid = (int) $p->idcategoria;
    DB::table('producto_categoria')->where('idproducto', $pid)->delete();
    DB::table('producto_categoria')->insert([
        'idproducto' => $pid,
        'idcategoria' => $cid,
    ]);
    $fixed++;
}

echo "Pivot alineado con idcategoria para {$fixed} productos con stock.\n";
