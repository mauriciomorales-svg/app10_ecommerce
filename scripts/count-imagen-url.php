<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$total = 0;
$with = 0;

App\Models\Producto::withoutGlobalScopes(['commerce_store'])
    ->orderBy('idproducto')
    ->chunk(200, function ($rows) use (&$total, &$with): void {
        foreach ($rows as $p) {
            $total++;
            if ($p->imagen_url) {
                $with++;
            }
        }
    });

echo "total={$total} with_url={$with} without=" . ($total - $with) . PHP_EOL;
