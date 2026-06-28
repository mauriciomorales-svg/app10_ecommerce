<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$d = json_decode(file_get_contents('http://127.0.0.1:8002/api/productos/1912'), true);
echo "nombre={$d['nombre']}\n";
echo 'has_bundle_options='.json_encode($d['has_bundle_options'] ?? null)."\n";
echo 'bundle_groups='.count($d['bundle_groups'] ?? [])."\n";

$list = json_decode(file_get_contents('http://127.0.0.1:8002/api/productos?buscar=Caf%C3%A9'), true);
foreach ($list['data'] ?? [] as $p) {
    if ((int) $p['idproducto'] === 1912) {
        echo "list bundle=".json_encode($p['has_bundle_options'] ?? null)."\n";
    }
}
