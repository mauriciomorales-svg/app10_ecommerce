<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$ids = [1887, 1886, 1884, 1883, 1878, 1880, 1912];
foreach ($ids as $id) {
    $p = DB::table('productos')->where('idproducto', $id)->first(['idproducto', 'nombre', 'idcategoria']);
    $legacy = $p->idcategoria ? DB::table('categoria')->where('idcategoria', $p->idcategoria)->value('nombre') : '-';
    $pivot = DB::table('producto_categoria as pc')
        ->join('categoria as c', 'pc.idcategoria', '=', 'c.idcategoria')
        ->where('pc.idproducto', $id)
        ->pluck('c.nombre')
        ->join(', ');
    echo "[{$id}] {$p->nombre}\n  legacy={$legacy}\n  pivot={$pivot}\n\n";
}
