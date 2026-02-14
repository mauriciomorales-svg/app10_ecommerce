<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== TABLA: productos ===\n\n";
$cols = DB::select("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'productos' ORDER BY ordinal_position");
echo str_pad('COLUMNA', 25) . str_pad('TIPO', 25) . str_pad('NULL', 6) . "DEFAULT\n";
echo str_repeat('-', 80) . "\n";
foreach ($cols as $c) {
    echo str_pad($c->column_name, 25) . str_pad($c->data_type, 25) . str_pad($c->is_nullable, 6) . ($c->column_default ?? '') . "\n";
}

echo "\n=== TABLA: producto_categoria ===\n\n";
$cols2 = DB::select("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'producto_categoria' ORDER BY ordinal_position");
foreach ($cols2 as $c) {
    echo str_pad($c->column_name, 25) . str_pad($c->data_type, 25) . $c->is_nullable . "\n";
}

echo "\n=== TABLA: categoria ===\n\n";
$cols3 = DB::select("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'categoria' ORDER BY ordinal_position");
foreach ($cols3 as $c) {
    echo str_pad($c->column_name, 25) . str_pad($c->data_type, 25) . $c->is_nullable . "\n";
}

$total = DB::select("SELECT count(*) as total FROM productos");
echo "\nTotal productos: " . $total[0]->total . "\n";
