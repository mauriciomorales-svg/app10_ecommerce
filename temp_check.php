<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$p = App\Models\Producto::first();
echo "ID: " . $p->idproducto . "\n";
echo "Nombre: " . $p->nombre . "\n";
echo "Stock (raw): " . var_export($p->getAttributes()['stock'] ?? 'NOT SET', true) . "\n";
echo "Precio (raw): " . var_export($p->getAttributes()['precio_venta'] ?? 'NOT SET', true) . "\n";
