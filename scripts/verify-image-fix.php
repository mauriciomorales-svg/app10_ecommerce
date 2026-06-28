<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$p = App\Models\Producto::withoutGlobalScopes(['commerce_store'])->find(23);
echo 'id23 url=' . ($p->imagen_url ?? 'NULL') . PHP_EOL;

$p2 = App\Models\Producto::withoutGlobalScopes(['commerce_store'])->where('nombre', 'like', '%Coca-Cola 2L%')->first();
echo 'coca url=' . ($p2?->imagen_url ?? 'NULL') . PHP_EOL;

$with = 0;
App\Models\Producto::withoutGlobalScopes(['commerce_store'])->orderBy('idproducto')->chunk(300, function ($rows) use (&$with): void {
    foreach ($rows as $p) {
        if ($p->imagen_url) {
            $with++;
        }
    }
});
echo "total_with_imagen_url={$with}" . PHP_EOL;

$first = App\Models\Producto::withoutGlobalScopes(['commerce_store']);
App\Services\ProductImageUrlService::applyImageFirstOrdering($first);
$row = $first->orderByDesc('idproducto')->first();
echo 'admin_page1_first=' . $row->nombre . ' | url=' . ($row->imagen_url ?? 'NULL') . PHP_EOL;
