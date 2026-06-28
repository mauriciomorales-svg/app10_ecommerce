<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$cls = App\Filament\Resources\ProductoResource\Pages\ListProductos::class;
$methods = ['setPage', 'setLivewirePage', 'gotoPage', 'nextPage', 'flushCachedTableRecords', 'getTablePaginationPageName'];

foreach ($methods as $m) {
    echo $m . '=' . (method_exists($cls, $m) ? 'yes' : 'NO') . PHP_EOL;
}

$component = app()->make($cls);
$component->bootInitializesFilamentTable();
$component->bootedInteractsWithTable();

echo 'perPage=' . var_export($component->getTableRecordsPerPage(), true) . PHP_EOL;

try {
    $component->gotoPage(2, 'page');
    echo 'after_goto page=' . $component->getPage('page') . PHP_EOL;
    $records = $component->getTableRecords();
    echo 'records_page=' . $records->currentPage() . ' count=' . $records->count() . PHP_EOL;
} catch (Throwable $e) {
    echo 'ERROR: ' . $e->getMessage() . PHP_EOL;
}
