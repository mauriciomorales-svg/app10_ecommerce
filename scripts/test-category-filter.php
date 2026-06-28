<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$base = 'http://127.0.0.1:8002';

foreach ([4 => 'Bebidas', 13 => 'Lácteos', 3 => 'Snacks'] as $catId => $label) {
    $d = json_decode(file_get_contents("{$base}/api/productos?categoria={$catId}"), true);
    echo "=== {$label} (id={$catId}) total=".($d['total'] ?? 0)." ===\n";
    foreach (array_slice($d['data'] ?? [], 0, 4) as $p) {
        echo sprintf(
            "  [%d] %s stock=%s bundle=%s\n",
            $p['idproducto'],
            mb_substr($p['nombre'], 0, 30),
            $p['stock_actual'] ?? $p['stock'] ?? 0,
            json_encode($p['has_bundle_options'] ?? false)
        );
    }
}
