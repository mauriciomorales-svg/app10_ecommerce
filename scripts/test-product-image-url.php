<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$p = App\Models\Producto::withoutGlobalScopes(['commerce_store'])
    ->where('codigobarra', 'TOPPI-COMBO-MEGAANTOJO')
    ->first();

echo 'imagen_url=' . ($p->imagen_url ?? 'null') . PHP_EOL;
echo 'productImageUrl=' . (App\Filament\Resources\ProductoResource::productImageUrl($p) ?? 'null') . PHP_EOL;
