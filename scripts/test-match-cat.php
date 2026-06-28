<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\ProductCategorySync;

$rules = config('catalog_categories.rules');
foreach (['Papel Higiénico x4', 'Yerba Mate 1kg', 'Aceite Girasol 900ml', 'Cerveza Quilmes', 'Coca Cola 2L', 'Café', 'Marraqueta'] as $n) {
    echo $n.' => '.(ProductCategorySync::matchCategoryName($n, $rules) ?? 'null')."\n";
}
