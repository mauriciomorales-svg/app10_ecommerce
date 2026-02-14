<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

// Eliminar pack de prueba (cascade borra producto_composicion)
$deleted = DB::table('productos')->where('codigobarra', 'PACK-TEST-001')->delete();
echo "Pack de prueba eliminado: {$deleted}\n";
