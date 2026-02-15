<?php
$pdo = new PDO('pgsql:host=localhost;dbname=dbisabel2', 'postgres', 'postgres');

// Ver columnas de la tabla productos
echo "=== COLUMNAS TABLA PRODUCTOS ===\n";
$cols = $pdo->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'productos' AND column_name LIKE '%imag%' OR column_name LIKE '%foto%' OR column_name LIKE '%url%' ORDER BY ordinal_position")->fetchAll(PDO::FETCH_ASSOC);
foreach ($cols as $c) {
    echo "{$c['column_name']} ({$c['data_type']})\n";
}

$total = $pdo->query("SELECT COUNT(*) FROM productos")->fetchColumn();
echo "\nTotal productos: $total\n";

// Verificar archivos físicos en fotos_productos
$dir = __DIR__ . '/public/fotos_productos/';
$archivos = glob($dir . '*.*');
echo "Archivos en fotos_productos/: " . count($archivos) . "\n\n";

// Verificar por código de barras (los archivos suelen ser codigobarra.jpg)
$productos = $pdo->query("SELECT idproducto, nombre, codigobarra FROM productos ORDER BY idproducto")->fetchAll(PDO::FETCH_ASSOC);

$conFoto = 0;
$sinFoto = 0;
$sinFotoList = [];

foreach ($productos as $p) {
    $found = false;
    $cb = $p['codigobarra'];
    if ($cb) {
        foreach (['jpg','jpeg','png','webp'] as $ext) {
            if (file_exists($dir . $cb . '.' . $ext)) {
                $found = true;
                break;
            }
        }
    }
    if (!$found) {
        // Buscar por idproducto
        foreach (['jpg','jpeg','png','webp'] as $ext) {
            if (file_exists($dir . $p['idproducto'] . '.' . $ext)) {
                $found = true;
                break;
            }
        }
    }
    if ($found) {
        $conFoto++;
    } else {
        $sinFoto++;
        if (count($sinFotoList) < 30) {
            $sinFotoList[] = "#{$p['idproducto']} - {$p['nombre']} (cb: $cb)";
        }
    }
}

echo "=== RESULTADO ===\n";
echo "Con foto: $conFoto\n";
echo "Sin foto: $sinFoto\n\n";

echo "=== PRIMEROS 30 SIN FOTO ===\n";
foreach ($sinFotoList as $line) {
    echo "$line\n";
}
