<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$p = App\Models\Producto::withoutGlobalScopes(['commerce_store'])
    ->where('codigobarra', 'TOPPI-COMBO-MEGAANTOJO')
    ->first();

echo 'fotoPreviewUrl=' . (App\Filament\Resources\ProductoResource::fotoPreviewUrl($p) ?? 'null') . PHP_EOL;
echo 'imagen_url=' . ($p->imagen_url ?? 'null') . PHP_EOL;
echo 'file=' . (is_file(public_path('fotos_productos/TOPPI-COMBO-MEGAANTOJO.png')) ? 'yes' : 'no') . PHP_EOL;
