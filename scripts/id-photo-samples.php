<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$dir = public_path('fotos_productos/');
$samples = [];

App\Models\Producto::withoutGlobalScopes(['commerce_store'])
    ->orderBy('idproducto')
    ->chunk(300, function ($rows) use ($dir, &$samples): void {
        foreach ($rows as $p) {
            $byCodigo = false;
            if ($p->codigobarra) {
                foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
                    if (is_file($dir . $p->codigobarra . '.' . $ext)) {
                        $byCodigo = true;
                        break;
                    }
                }
            }
            if ($byCodigo) {
                continue;
            }
            foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
                if (is_file($dir . $p->idproducto . '.' . $ext)) {
                    $samples[] = [
                        'nombre' => $p->nombre,
                        'id' => $p->idproducto,
                        'cod' => $p->codigobarra ?: 'EMPTY',
                        'file' => $p->idproducto . '.' . $ext,
                        'imagen_url' => $p->imagen_url,
                    ];
                    if (count($samples) >= 10) {
                        return;
                    }
                    break;
                }
            }
        }
    });

foreach ($samples as $s) {
    echo "{$s['nombre']} | id={$s['id']} | cod={$s['cod']} | file={$s['file']} | url=" . ($s['imagen_url'] ?? 'NULL') . "\n";
}
