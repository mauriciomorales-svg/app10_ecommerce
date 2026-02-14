<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$row = DB::select("SELECT idproducto, octet_length(imagen) as img_size, encode(substring(imagen from 1 for 50), 'escape') as img_preview FROM productos WHERE idproducto = 1430");
foreach ($row as $r) {
    echo "id: {$r->idproducto}\n";
    echo "img_size: {$r->img_size} bytes\n";
    echo "img_preview: {$r->img_preview}\n";
}

// Check how many products have images
$count = DB::select("SELECT count(*) as total FROM productos WHERE imagen IS NOT NULL AND octet_length(imagen) > 10");
echo "\nProductos con imagen: {$count[0]->total}\n";

// Check if imagen is a path or binary
$sample = DB::select("SELECT idproducto, encode(imagen, 'escape') as img_text FROM productos WHERE imagen IS NOT NULL LIMIT 3");
foreach ($sample as $s) {
    $preview = substr($s->img_text, 0, 100);
    echo "id {$s->idproducto}: {$preview}\n";
}
