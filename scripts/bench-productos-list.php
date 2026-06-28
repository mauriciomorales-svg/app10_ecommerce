<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$t = microtime(true);

$query = App\Models\Producto::withoutGlobalScopes(['commerce_store']);
$query->getModel()->setAppends([]);
$page = $query->with(['categoria:idcategoria,nombre'])
    ->orderBy('idproducto', 'desc')
    ->paginate(25);

echo 'count=' . $page->count() . ' total=' . $page->total() . ' ms=' . round((microtime(true) - $t) * 1000) . PHP_EOL;
