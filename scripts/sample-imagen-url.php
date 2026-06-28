<?php
$j = json_decode(file_get_contents('https://www.dondemorales.cl/api/productos?page=1'), true);
foreach (array_slice($j['data'] ?? [], 0, 8) as $p) {
    echo ($p['nombre'] ?? '?') . ' => ' . ($p['imagen_url'] ?? 'null') . PHP_EOL;
}
