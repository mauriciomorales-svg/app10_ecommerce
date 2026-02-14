<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check for USER-DEFINED columns (vector type)
$cols = DB::select("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'productos' AND data_type = 'USER-DEFINED'");
echo "USER-DEFINED columns in productos:\n";
foreach ($cols as $c) {
    echo "  - {$c->column_name} ({$c->udt_name})\n";
}

// Try simple query without with()
echo "\nSimple query test:\n";
try {
    $p = DB::select("SELECT idproducto, nombre, precio FROM productos WHERE nombre ILIKE '%cachantun%' LIMIT 3");
    foreach ($p as $r) {
        echo "  - {$r->nombre} | {$r->precio}\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Try Eloquent without with()
echo "\nEloquent without with():\n";
try {
    $productos = \App\Models\Producto::where('nombre', 'ilike', '%cachantun%')->limit(3)->get();
    echo "  Found: " . $productos->count() . "\n";
    foreach ($productos as $p) {
        echo "  - {$p->nombre}\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Try Eloquent with with()
echo "\nEloquent with with('categoria'):\n";
try {
    $productos = \App\Models\Producto::with('categoria')->where('nombre', 'ilike', '%cachantun%')->limit(3)->get();
    echo "  Found: " . $productos->count() . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

// Try JSON encode
echo "\nJSON encode test:\n";
try {
    $productos = \App\Models\Producto::where('nombre', 'ilike', '%cachantun%')->limit(1)->get();
    $json = json_encode($productos);
    if ($json === false) {
        echo "  JSON error: " . json_last_error_msg() . "\n";
    } else {
        echo "  OK, length: " . strlen($json) . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
