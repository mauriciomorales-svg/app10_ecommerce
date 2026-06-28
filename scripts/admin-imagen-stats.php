<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$products = App\Models\Producto::withoutGlobalScopes(['commerce_store'])
    ->orderByDesc('idproducto')
    ->limit(25)
    ->get();

$with = 0;
$without = 0;

foreach ($products as $p) {
    $url = $p->imagen_url;
    if ($url) {
        $with++;
    } else {
        $without++;
    }
    echo ($p->codigobarra ?? '?') . ' => ' . ($url ?? 'NULL') . PHP_EOL;
}

echo "--- with={$with} without={$without}" . PHP_EOL;
