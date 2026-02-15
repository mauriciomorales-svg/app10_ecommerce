<?php
set_time_limit(0);

$SERPER_KEY = '1ec78c30f88e358fa0f028ecb9b99adc371225a1';
$pdo = new PDO('pgsql:host=localhost;dbname=dbisabel2', 'postgres', 'postgres');
$dir = __DIR__ . '/public/fotos_productos/';

if (!is_dir($dir)) mkdir($dir, 0777, true);

$productos = $pdo->query("SELECT p.idproducto, p.nombre, p.codigobarra FROM productos p ORDER BY p.idproducto")->fetchAll(PDO::FETCH_ASSOC);

$descargadas = 0;
$fallidas = 0;
$yaExisten = 0;
$total = count($productos);
$apiCalls = 0;

echo "=== DESCARGA DE IMAGENES CON SERPER.DEV ===\n";
echo "Total productos: $total\n\n";

function searchSerperImage($query, $apiKey) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://google.serper.dev/images',
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['q' => $query, 'num' => 3]),
        CURLOPT_HTTPHEADER => [
            'X-API-KEY: ' . $apiKey,
            'Content-Type: application/json'
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        return json_decode($response, true);
    }
    return null;
}

function downloadImage($url, $filepath) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT => 'Mozilla/5.0',
    ]);
    $data = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);

    if ($httpCode === 200 && $data && strlen($data) > 2000 && strpos($contentType, 'image') !== false) {
        file_put_contents($filepath, $data);
        return true;
    }
    return false;
}

foreach ($productos as $i => $p) {
    $cb = trim($p['codigobarra']);
    $id = $p['idproducto'];
    $nombre = $p['nombre'];

    // Verificar si ya tiene foto
    $existe = false;
    foreach (['jpg','jpeg','png','webp'] as $ext) {
        if (file_exists($dir . $cb . '.' . $ext) || file_exists($dir . $id . '.' . $ext)) {
            $existe = true;
            break;
        }
    }
    if ($existe) {
        $yaExisten++;
        continue;
    }

    // Buscar imagen por nombre del producto
    $query = $nombre . ' producto chile';
    $result = searchSerperImage($query, $SERPER_KEY);
    $apiCalls++;

    $found = false;
    if ($result && isset($result['images'])) {
        foreach ($result['images'] as $img) {
            $imgUrl = $img['imageUrl'] ?? '';
            if (!$imgUrl) continue;

            // Determinar extensión
            $ext = 'jpg';
            if (strpos($imgUrl, '.png') !== false) $ext = 'png';
            if (strpos($imgUrl, '.webp') !== false) $ext = 'webp';

            $filename = ($cb && $cb !== 'SIN_CODIGO') ? $cb : $id;
            $filepath = $dir . $filename . '.' . $ext;

            if (downloadImage($imgUrl, $filepath)) {
                $descargadas++;
                $found = true;
                echo "[OK] #{$id} - {$nombre} -> {$filename}.{$ext}\n";
                break;
            }
        }
    }

    if (!$found) {
        $fallidas++;
    }

    // Progreso cada 50 descargas
    if ($descargadas > 0 && $descargadas % 50 === 0 && $found) {
        echo "=== REPORTE: $descargadas descargadas | $fallidas fallidas | $apiCalls llamadas API | Procesados: " . ($i + 1) . "/$total ===\n";
    }

    // Pausa 200ms entre llamadas
    usleep(200000);
}

echo "\n=== RESULTADO FINAL ===\n";
echo "Ya existian: $yaExisten\n";
echo "Descargadas nuevas: $descargadas\n";
echo "No encontradas: $fallidas\n";
echo "Llamadas API Serper: $apiCalls\n";
echo "Total procesados: $total\n";
