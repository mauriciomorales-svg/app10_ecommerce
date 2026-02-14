<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check if producto_categoria pivot table exists
$pivot = DB::select("SELECT count(*) as total FROM producto_categoria");
echo "producto_categoria: {$pivot[0]->total} relaciones\n";

// Check idcategoria in productos table
$direct = DB::select("SELECT count(*) as total FROM productos WHERE idcategoria IS NOT NULL");
echo "productos con idcategoria directo: {$direct[0]->total}\n";

// Sample pivot
$sample = DB::select("SELECT pc.idproducto, c.nombre as cat, p.nombre as prod FROM producto_categoria pc JOIN categoria c ON c.idcategoria = pc.idcategoria JOIN productos p ON p.idproducto = pc.idproducto LIMIT 5");
echo "\nEjemplos pivot:\n";
foreach ($sample as $s) {
    echo "  {$s->prod} -> {$s->cat}\n";
}

// Check bebidas via pivot
$bebidas = DB::select("SELECT count(*) as total FROM producto_categoria WHERE idcategoria = 1");
echo "\nBebidas via pivot: {$bebidas[0]->total} productos\n";

// Check bebidas via direct
$bebidasDirect = DB::select("SELECT count(*) as total FROM productos WHERE idcategoria = 1");
echo "Bebidas via idcategoria directo: {$bebidasDirect[0]->total} productos\n";
