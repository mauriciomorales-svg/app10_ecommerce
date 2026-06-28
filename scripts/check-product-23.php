<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$p = App\Models\Producto::withoutGlobalScopes(['commerce_store'])->find(23);
$raw = $p->getAttributes()['imagen'] ?? null;
echo 'nombre=' . $p->nombre . PHP_EOL;
echo 'codigobarra=' . $p->codigobarra . PHP_EOL;
echo 'bytea=' . (($raw && strlen((string) $raw) > 0) ? 'yes' : 'no') . PHP_EOL;
echo 'file23=' . (is_file(public_path('fotos_productos/23.jpg')) ? 'yes' : 'no') . PHP_EOL;
echo 'api_imagen=' . (curl_get('https://www.dondemorales.cl/api/productos/23/imagen') ?: 'fail') . PHP_EOL;

function curl_get($url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_NOBODY => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_FOLLOWLOCATION => true]);
    curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return $code;
}

echo 'http_code=' . curl_get('https://www.dondemorales.cl/api/productos/23/imagen') . PHP_EOL;
