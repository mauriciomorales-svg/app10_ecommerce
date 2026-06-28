<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$names = ['Manjar', 'Mermelada', 'Marraqueta', 'Hallulla', 'Pack Once Completa'];

foreach ($names as $nombre) {
    $p = App\Models\Producto::withoutGlobalScopes(['commerce_store'])
        ->where('nombre', 'like', '%' . $nombre . '%')
        ->first();

    if (! $p) {
        echo "{$nombre}: NOT FOUND\n";
        continue;
    }

    $rawImagen = $p->getAttributes()['imagen'] ?? null;
    $hasBytea = $rawImagen && (is_resource($rawImagen) || strlen((string) $rawImagen) > 0);

    echo "{$p->nombre}\n";
    echo "  id={$p->idproducto}\n";
    echo "  codigobarra=" . ($p->codigobarra ?: 'EMPTY') . "\n";
    echo "  imagen_url=" . ($p->imagen_url ?? 'NULL') . "\n";
    echo "  bytea=" . ($hasBytea ? 'yes' : 'no') . "\n";

    if ($p->codigobarra) {
        foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
            $path = public_path("fotos_productos/{$p->codigobarra}.{$ext}");
            if (is_file($path)) {
                echo "  file={$p->codigobarra}.{$ext}\n";
            }
        }
    }

    echo "\n";
}
