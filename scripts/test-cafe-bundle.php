<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$base = 'http://127.0.0.1:8002';
$d = json_decode(file_get_contents("{$base}/api/productos?buscar=cafe"), true);
echo "Buscar cafe: total=".($d['total'] ?? 0)."\n";
foreach ($d['data'] ?? [] as $p) {
    echo sprintf(
        "  [%d] %s bundle=%s custom=%s stock=%s\n",
        $p['idproducto'],
        $p['nombre'],
        json_encode($p['has_bundle_options'] ?? null),
        json_encode($p['has_customization'] ?? null),
        $p['stock_actual'] ?? 0
    );
}
