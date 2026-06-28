<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$withCodigo = App\Models\Producto::withoutGlobalScopes(['commerce_store'])
    ->whereNotNull('codigobarra')
    ->where('codigobarra', '!=', '')
    ->where('codigobarra', 'not like', 'TOPPI-%')
    ->count();

$withUrl = 0;
$withCodigoNoFile = 0;
$noCodigo = App\Models\Producto::withoutGlobalScopes(['commerce_store'])
    ->where(function ($q) {
        $q->whereNull('codigobarra')->orWhere('codigobarra', '');
    })
    ->count();

App\Models\Producto::withoutGlobalScopes(['commerce_store'])
    ->whereNotNull('codigobarra')
    ->where('codigobarra', '!=', '')
    ->where('codigobarra', 'not like', 'TOPPI-%')
    ->orderBy('idproducto')
    ->chunk(200, function ($rows) use (&$withUrl, &$withCodigoNoFile): void {
        foreach ($rows as $p) {
            if ($p->imagen_url) {
                $withUrl++;
            } else {
                $withCodigoNoFile++;
            }
        }
    });

echo "no_codigobarra={$noCodigo}\n";
echo "legacy_with_codigo={$withCodigo}\n";
echo "legacy_with_imagen_url={$withUrl}\n";
echo "legacy_codigo_but_no_file={$withCodigoNoFile}\n";

$samples = App\Models\Producto::withoutGlobalScopes(['commerce_store'])
    ->whereNotNull('codigobarra')
    ->where('codigobarra', '!=', '')
    ->where('codigobarra', 'not like', 'TOPPI-%')
    ->orderByDesc('idproducto')
    ->limit(5)
    ->get(['idproducto', 'nombre', 'codigobarra']);

echo "\nSamples:\n";
foreach ($samples as $p) {
    $full = App\Models\Producto::find($p->idproducto);
    echo "{$p->nombre} | {$p->codigobarra} | " . ($full->imagen_url ?? 'NULL') . "\n";
}
