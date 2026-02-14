<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Verificar columnas reales de la tabla
$columns = Illuminate\Support\Facades\DB::select("SELECT column_name FROM information_schema.columns WHERE table_name = 'productos' ORDER BY ordinal_position");

echo "COLUMNAS EN TABLA PRODUCTOS:\n";
foreach ($columns as $col) {
    echo "  - " . $col->column_name . "\n";
}

echo "\n";
echo "DATOS PRIMER PRODUCTO:\n";
$p = App\Models\Producto::first();
foreach ($p->getAttributes() as $key => $value) {
    echo "  $key: " . var_export($value, true) . "\n";
}
