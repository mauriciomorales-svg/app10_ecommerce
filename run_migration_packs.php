<?php
require '/app/vendor/autoload.php';
$app = require_once '/app/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// 1. Agregar columna es_pack a productos
if (!Schema::hasColumn('productos', 'es_pack')) {
    DB::statement("ALTER TABLE productos ADD COLUMN es_pack BOOLEAN DEFAULT false");
    echo "✓ Columna es_pack agregada a productos\n";
} else {
    echo "- Columna es_pack ya existe\n";
}

// 2. Crear tabla producto_composicion
if (!Schema::hasTable('producto_composicion')) {
    DB::statement("
        CREATE TABLE producto_composicion (
            id_pack INTEGER NOT NULL,
            id_componente INTEGER NOT NULL,
            cantidad INTEGER NOT NULL DEFAULT 1,
            PRIMARY KEY (id_pack, id_componente),
            FOREIGN KEY (id_pack) REFERENCES productos(idproducto) ON DELETE CASCADE,
            FOREIGN KEY (id_componente) REFERENCES productos(idproducto) ON DELETE RESTRICT
        )
    ");
    echo "✓ Tabla producto_composicion creada\n";
} else {
    echo "- Tabla producto_composicion ya existe\n";
}

// Verificar
$cols = DB::select("SELECT column_name FROM information_schema.columns WHERE table_name = 'productos' AND column_name = 'es_pack'");
echo "\nVerificación: es_pack existe = " . (count($cols) > 0 ? 'SI' : 'NO') . "\n";

$tables = DB::select("SELECT tablename FROM pg_tables WHERE tablename = 'producto_composicion'");
echo "Verificación: producto_composicion existe = " . (count($tables) > 0 ? 'SI' : 'NO') . "\n";
