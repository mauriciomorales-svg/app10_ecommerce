<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Producto;

// Crear un pack de prueba: "Pack Enamorados" = 1x Rosa + 1x Chocolate
// Primero buscar 2 productos con stock para usar como componentes
$comp1 = Producto::where('stock_actual', '>', 10)->where('precio', '>', 0)->first();
$comp2 = Producto::where('stock_actual', '>', 10)->where('precio', '>', 0)->where('idproducto', '!=', $comp1->idproducto)->first();

echo "Componente 1: {$comp1->nombre} (ID:{$comp1->idproducto}, stock:{$comp1->stock_actual}, precio:{$comp1->precio})\n";
echo "Componente 2: {$comp2->nombre} (ID:{$comp2->idproducto}, stock:{$comp2->stock_actual}, precio:{$comp2->precio})\n";

// Crear el pack
$pack = Producto::create([
    'nombre' => 'Pack Enamorados Premium (TEST)',
    'descripcion' => 'Incluye: ' . $comp1->nombre . ' + ' . $comp2->nombre,
    'codigobarra' => 'PACK-TEST-001',
    'precio' => intval($comp1->precio + $comp2->precio - 500), // Descuento de 500
    'precio_costo' => intval($comp1->precio_costo + $comp2->precio_costo),
    'stock_actual' => 0, // No se usa, se calcula dinámicamente
    'es_pack' => true,
    'activo' => true,
]);

echo "\nPack creado: {$pack->nombre} (ID:{$pack->idproducto}, precio:{$pack->precio})\n";

// Agregar componentes
DB::table('producto_composicion')->insert([
    ['id_pack' => $pack->idproducto, 'id_componente' => $comp1->idproducto, 'cantidad' => 2],
    ['id_pack' => $pack->idproducto, 'id_componente' => $comp2->idproducto, 'cantidad' => 1],
]);

echo "Composición: 2x {$comp1->nombre} + 1x {$comp2->nombre}\n";

// Verificar stock dinámico
$pack->refresh();
$pack->load('componentes');
echo "\nStock dinámico del pack: {$pack->stock_disponible}\n";
echo "  - {$comp1->nombre}: stock={$comp1->stock_actual}, necesita=2, packs posibles=" . floor($comp1->stock_actual / 2) . "\n";
echo "  - {$comp2->nombre}: stock={$comp2->stock_actual}, necesita=1, packs posibles=" . floor($comp2->stock_actual / 1) . "\n";

// Verificar JSON output
$json = $pack->toArray();
echo "\nJSON keys: " . implode(', ', array_keys($json)) . "\n";
echo "es_pack: " . ($json['es_pack'] ? 'true' : 'false') . "\n";
echo "stock_disponible: " . $json['stock_disponible'] . "\n";
