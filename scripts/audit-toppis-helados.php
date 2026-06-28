<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$parents = [
    'TOPPI-YOGEN-MIX-MED',
    'TOPPI-PARENT-HELADO',
    'TOPPI-COMBO-CHOCOBOMBA',
];

foreach ($parents as $sku) {
    $id = DB::table('productos')->where('codigobarra', $sku)->value('idproducto');
    echo "\n=== $sku id=$id ===\n";
    if (!$id) {
        echo "MISSING\n";
        continue;
    }
    $rows = DB::table('product_bundle_options as b')
        ->join('productos as ch', 'ch.idproducto', '=', 'b.child_product_id')
        ->where('b.parent_product_id', $id)
        ->orderBy('b.group_name')
        ->orderBy('b.sort_order')
        ->get(['b.group_name', 'b.price_modifier', 'b.is_required', 'ch.codigobarra', 'ch.nombre']);
    foreach ($rows as $r) {
        echo "{$r->group_name} | mod={$r->price_modifier} | {$r->codigobarra} | {$r->nombre}\n";
    }
}

echo "\n=== Wrong wok rows on helado parents ===\n";
$bad = DB::select("
    SELECT pp.codigobarra AS parent_sku, b.group_name, ch.codigobarra, ch.nombre
    FROM product_bundle_options b
    JOIN productos pp ON pp.idproducto = b.parent_product_id
    JOIN productos ch ON ch.idproducto = b.child_product_id
    WHERE ch.codigobarra LIKE 'TOPPI-WOK-%'
      AND (pp.codigobarra LIKE 'TOPPI-YOGEN%' OR pp.codigobarra LIKE 'TOPPI-COMBO%' OR pp.codigobarra = 'TOPPI-PARENT-HELADO')
");
foreach ($bad as $r) {
    echo "{$r->parent_sku} | {$r->group_name} | {$r->codigobarra} | {$r->nombre}\n";
}
if (!$bad) {
    echo "none\n";
}
