<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Producto;

echo "=== STOCK DISPONIBLE ===\n";
foreach ([1912, 1921, 1918, 1919, 1924] as $id) {
    $p = Producto::find($id);
    if ($p) {
        echo "[{$id}] {$p->nombre}: stock_actual={$p->stock_actual} disponible={$p->stock_disponible} activo=".($p->activo ?? 'n/a')."\n";
    }
}

echo "\n=== DESTACADOS API ===\n";
$list = json_decode(file_get_contents('http://127.0.0.1:8002/api/productos/destacados'), true);
foreach ($list as $p) {
    echo sprintf(
        "[%d] %s | bundle=%s custom=%s stock=%s\n",
        $p['idproducto'],
        $p['nombre'],
        json_encode($p['has_bundle_options'] ?? false),
        json_encode($p['has_customization'] ?? false),
        $p['stock_disponible'] ?? $p['stock_actual'] ?? 0
    );
}

echo "\n=== DUPLICADOS DESACTIVADOS ===\n";
foreach ([1909, 1911, 1930, 1931, 1932] as $id) {
    $p = DB::table('productos')->where('idproducto', $id)->first(['nombre', 'activo', 'stock_actual']);
    if ($p) {
        echo "[{$id}] {$p->nombre} activo=".json_encode($p->activo ?? null)." stock={$p->stock_actual}\n";
    }
}
