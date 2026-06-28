<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
foreach (DB::table('categoria')->orderBy('nombre')->get() as $c) {
    echo "{$c->idcategoria}\t{$c->nombre}\n";
}
