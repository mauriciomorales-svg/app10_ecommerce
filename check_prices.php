<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Buscar productos con precio > 0
$productos = App\Models\Producto::where('precio', '>', 0)->limit(5)->get();

echo "PRODUCTOS CON PRECIO > 0:\n";
foreach ($productos as $p) {
    echo "  - " . $p->nombre . " | Stock: " . $p->stock . " | Precio: $" . $p->precio_venta . "\n";
}

echo "\nTotal productos con precio > 0: " . App\Models\Producto::where('precio', '>', 0)->count() . "\n";
