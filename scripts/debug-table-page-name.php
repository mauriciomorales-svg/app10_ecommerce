<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$component = new App\Filament\Resources\ProductoResource\Pages\ListProductos();
$component->bootedInteractsWithTable();

if (method_exists($component, 'mountInteractsWithTable')) {
    $component->mountInteractsWithTable();
    $component->bootedInteractsWithTable();
}

echo 'pageName=' . $component->getTablePaginationPageName() . PHP_EOL;

$query = App\Filament\Resources\ProductoResource::getEloquentQuery();
$query->getModel()->setAppends([]);
$paginator = $query->orderBy('idproducto', 'desc')->paginate(25, ['*'], $component->getTablePaginationPageName());

echo 'paginatorPageName=' . $paginator->getPageName() . PHP_EOL;
echo 'match=' . ($paginator->getPageName() === $component->getTablePaginationPageName() ? 'yes' : 'NO') . PHP_EOL;
