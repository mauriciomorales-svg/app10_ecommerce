<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$base = getenv('API_BASE') ?: 'http://127.0.0.1:8002';

foreach (['/api/productos?page=1', '/api/productos?categoria=1'] as $path) {
    echo "=== GET {$path} ===\n";
    $json = @file_get_contents($base.$path);
    if (!$json) {
        echo "  ERROR fetch\n\n";
        continue;
    }
    $d = json_decode($json, true);
    echo '  total='.($d['total'] ?? '?')."\n";
    foreach (array_slice($d['data'] ?? [], 0, 5) as $p) {
        echo sprintf(
            "  [%d] %s | bundle=%s custom=%s stock=%s\n",
            $p['idproducto'],
            mb_substr($p['nombre'], 0, 35),
            json_encode($p['has_bundle_options'] ?? null),
            json_encode($p['has_customization'] ?? null),
            $p['stock_actual'] ?? $p['stock'] ?? '?'
        );
    }
    echo "\n";
}
