<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$dir = public_path('fotos_productos/');
$byCodigo = 0;
$byId = 0;
$none = 0;

App\Models\Producto::withoutGlobalScopes(['commerce_store'])
    ->orderBy('idproducto')
    ->chunk(300, function ($rows) use ($dir, &$byCodigo, &$byId, &$none): void {
        foreach ($rows as $p) {
            $found = false;
            if ($p->codigobarra) {
                foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
                    if (is_file($dir . $p->codigobarra . '.' . $ext)) {
                        $byCodigo++;
                        $found = true;
                        break;
                    }
                }
            }
            if (! $found) {
                foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
                    if (is_file($dir . $p->idproducto . '.' . $ext)) {
                        $byId++;
                        $found = true;
                        break;
                    }
                }
            }
            if (! $found) {
                $none++;
            }
        }
    });

echo "match_by_codigobarra={$byCodigo}\n";
echo "match_by_idproducto={$byId}\n";
echo "no_file={$none}\n";

// Products with codigobarra + file but accessor returns null?
$broken = 0;
App\Models\Producto::withoutGlobalScopes(['commerce_store'])
    ->whereNotNull('codigobarra')
    ->where('codigobarra', '!=', '')
    ->orderBy('idproducto')
    ->chunk(300, function ($rows) use (&$broken): void {
        foreach ($rows as $p) {
            $hasFile = false;
            foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
                if (is_file(public_path("fotos_productos/{$p->codigobarra}.{$ext}"))) {
                    $hasFile = true;
                    break;
                }
            }
            if ($hasFile && ! $p->imagen_url) {
                $broken++;
                echo "BROKEN: {$p->nombre} | {$p->codigobarra}\n";
            }
        }
    });

echo "broken_accessor={$broken}\n";
