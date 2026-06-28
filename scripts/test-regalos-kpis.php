<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$k = App\Services\RegalosKpisService::summary(7);
echo 'available='.($k['available'] ? 'yes' : 'no').PHP_EOL;
echo 'visitas='.($k['visitas_regalos']['page_views'] ?? 0).PHP_EOL;
echo 'quiz_iniciaron='.($k['funnel']['iniciaron'] ?? 0).PHP_EOL;
echo 'ventas_packs='.count($k['ventas_packs']).PHP_EOL;
