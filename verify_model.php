<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$p = App\Models\Producto::first();
echo 'Nombre: ' . $p->nombre . PHP_EOL;
echo 'precio (raw): ' . var_export($p->getAttributes()['precio'], true) . PHP_EOL;
echo 'stock_actual (raw): ' . var_export($p->getAttributes()['stock_actual'], true) . PHP_EOL;
echo 'precio_venta (accessor): ' . var_export($p->precio_venta, true) . PHP_EOL;
echo 'stock (accessor): ' . var_export($p->stock, true) . PHP_EOL;
