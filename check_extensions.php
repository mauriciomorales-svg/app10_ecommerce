<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

$exts = DB::select("SELECT extname FROM pg_extension");
foreach ($exts as $e) {
    echo $e->extname . "\n";
}

// Check pg_trgm
try {
    DB::statement("CREATE EXTENSION IF NOT EXISTS pg_trgm");
    echo "\npg_trgm: OK\n";
} catch (\Exception $e) {
    echo "\npg_trgm: " . $e->getMessage() . "\n";
}

// Check unaccent
try {
    DB::statement("CREATE EXTENSION IF NOT EXISTS unaccent");
    echo "unaccent: OK\n";
} catch (\Exception $e) {
    echo "unaccent: " . $e->getMessage() . "\n";
}

// Test similarity search
try {
    $results = DB::select("SELECT nombre, similarity(nombre, 'coca cola') as sim FROM productos WHERE similarity(nombre, 'coca cola') > 0.1 ORDER BY sim DESC LIMIT 5");
    echo "\nSimilarity search 'coca cola':\n";
    foreach ($results as $r) {
        echo "  - {$r->nombre} (sim: {$r->sim})\n";
    }
} catch (\Exception $e) {
    echo "\nSimilarity error: " . $e->getMessage() . "\n";
}
