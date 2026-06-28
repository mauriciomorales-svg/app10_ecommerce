<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$total = DB::table('productos')->count();
$conStock = DB::table('productos')->where('stock_actual', '>', 0)->count();
$activosStock = DB::table('productos')->where('activo', true)->where('stock_actual', '>', 0)->count();
$conCategoriaPivot = DB::table('productos as p')
    ->whereExists(function ($q) {
        $q->selectRaw('1')->from('producto_categoria as pc')->whereColumn('pc.idproducto', 'p.idproducto');
    })->where('p.stock_actual', '>', 0)->count();
$conIdCategoria = DB::table('productos')->where('stock_actual', '>', 0)->whereNotNull('idcategoria')->count();
$sugerencias = DB::table('producto_sugerencias')->where('activo', true)->count();

echo "productos_total={$total}\n";
echo "con_stock={$conStock}\n";
echo "activos_con_stock={$activosStock}\n";
echo "con_categoria_pivot_y_stock={$conCategoriaPivot}\n";
echo "con_idcategoria_y_stock={$conIdCategoria}\n";
echo "sugerencias_activas={$sugerencias}\n";
