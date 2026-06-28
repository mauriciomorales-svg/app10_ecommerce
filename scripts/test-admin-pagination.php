<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Livewire\Features\SupportPagination\SupportPagination;

// Simular hook Livewire que registra el page resolver
$component = app(App\Filament\Resources\ProductoResource\Pages\ListProductos::class);
$component->mount();

$hook = new SupportPagination();
// Cannot easily run hook...

$component->gotoPage(2, $component->getTablePaginationPageName());
echo 'paginator_key=' . $component->getTablePaginationPageName() . PHP_EOL;
echo 'page=' . $component->getPage($component->getTablePaginationPageName()) . PHP_EOL;

Paginator::currentPageResolver(function ($pageName) use ($component) {
    return (int) ($component->paginators[$pageName] ?? 1);
});

$records = $component->getTableRecords();
echo 'current_page=' . $records->currentPage() . ' count=' . $records->count() . PHP_EOL;
if ($records->count() > 0) {
    echo 'first_id=' . $records->first()->idproducto . PHP_EOL;
}
