<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Producto;

foreach ([1918, 1919, 1924, 1912, 1921] as $id) {
    $p = Producto::with(['componentes', 'bundleOptions', 'customizationFields'])->find($id);
    if (! $p) {
        echo "[{$id}] no encontrado\n";
        continue;
    }
    echo "[{$id}] {$p->nombre}\n";
    echo "  es_pack={$p->es_pack} stock_actual={$p->stock_actual} stock_disponible={$p->stock_disponible}\n";
    echo '  componentes='.$p->componentes->count().' bundle='.$p->bundleOptions->count().' custom='.$p->customizationFields->count()."\n";
    foreach ($p->componentes as $c) {
        echo "    - {$c->nombre} x{$c->pivot->cantidad} stock={$c->stock_actual}\n";
    }
    echo "\n";
}
