<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$out = App\Services\CartSuggestionService::forCart([1878]);
echo json_encode(['count' => count($out), 'items' => array_map(fn ($r) => [
    'id' => $r['idproducto'],
    'nombre' => $r['nombre'],
    'mensaje' => $r['mensaje'],
], $out)], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
