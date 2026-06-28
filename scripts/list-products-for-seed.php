<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$excludeNames = ['bolsa', 'caja regalo', 'traigo mi bolsa', 'empaque'];
$excludeIds = [1909, 1910, 1911, 1912, 1961, 1962, 1963, 1964];

$base = DB::table('productos')->where('stock_actual', '>', 0)->whereNotIn('idproducto', $excludeIds);

echo "=== TOP 60 ===\n";
$rows = (clone $base)->orderByDesc('veces_vendido')->limit(60)->get(['idproducto', 'nombre', 'veces_vendido', 'precio']);
foreach ($rows as $p) {
    echo "{$p->idproducto}\t{$p->veces_vendido}\t{$p->precio}\t{$p->nombre}\n";
}

$terms = [
    'coca', 'pepsi', 'sprite', 'fanta', 'bebida', 'jugo', 'agua', 'vital', 'cachantun',
    'cerveza', 'quilmes', 'corona', 'escudo',
    'leche', 'yogur', 'yogurt', 'queso', 'mantequilla', 'manjar', 'nutella',
    'pan', 'hallulla', 'marraqueta', 'gallet', 'oreo', 'cookie',
    'arroz', 'fideo', 'aceite', 'yerba', 'azucar', 'sal ',
    'papas', 'snack', 'ramen', 'chocolate', 'cereal',
    'cafe', 'café', 'te ', 'té',
    'huevo', 'atun', 'atún', 'salsa', 'mayonesa', 'ketchup',
    'detergente', 'cloro', 'suavizante', 'papel hig',
    'shampoo', 'jabon', 'jabón', 'pasta dental', 'desodor',
    'vino', 'pisco', 'whisky',
    'helado', 'completo', 'hot dog', 'hamburg',
    'cigarro', 'encendedor',
];

echo "\n=== BUSQUEDAS ===\n";
foreach ($terms as $t) {
    $q = (clone $base)->where('nombre', 'ilike', "%{$t}%");
    foreach ($excludeNames as $en) {
        $q->where('nombre', 'not ilike', "%{$en}%");
    }
    $found = $q->orderByDesc('veces_vendido')->limit(2)->get(['idproducto', 'nombre']);
    if ($found->isEmpty()) {
        continue;
    }
    echo "\n[{$t}]\n";
    foreach ($found as $f) {
        echo "  {$f->idproducto}: {$f->nombre}\n";
    }
}
