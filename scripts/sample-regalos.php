<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$rows = DB::table('productos as p')
    ->join('categoria as c', 'p.idcategoria', '=', 'c.idcategoria')
    ->where('c.nombre', 'Regalos y Ocasiones')
    ->select('p.nombre')
    ->limit(25)
    ->pluck('nombre');

foreach ($rows as $n) {
    echo $n."\n";
}
