<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== DUPLICADOS POR NOMBRE (stock > 0 o builder) ===\n\n";

$rows = DB::table('productos as p')
    ->leftJoin('customization_fields as cf', 'cf.product_id', '=', 'p.idproducto')
    ->leftJoin('product_bundle_options as bo', 'bo.parent_product_id', '=', 'p.idproducto')
    ->select(
        'p.nombre',
        DB::raw('count(distinct p.idproducto) as cnt'),
        DB::raw('string_agg(distinct p.idproducto::text, \', \' order by p.idproducto::text) as ids'),
        DB::raw('string_agg(distinct p.stock_actual::text, \', \') as stocks'),
        DB::raw('max(case when cf.id is not null then 1 else 0 end) as has_custom'),
        DB::raw('max(case when bo.id is not null then 1 else 0 end) as has_bundle')
    )
    ->where(function ($q) {
        $q->where('p.stock_actual', '>', 0)
            ->orWhereExists(function ($sub) {
                $sub->selectRaw('1')->from('customization_fields as c2')->whereColumn('c2.product_id', 'p.idproducto');
            })
            ->orWhereExists(function ($sub) {
                $sub->selectRaw('1')->from('product_bundle_options as b2')->whereColumn('b2.parent_product_id', 'p.idproducto');
            });
    })
    ->groupBy('p.nombre')
    ->havingRaw('count(distinct p.idproducto) > 1')
    ->orderByDesc('cnt')
    ->limit(40)
    ->get();

foreach ($rows as $r) {
    echo "{$r->nombre}\n  ids: {$r->ids} | stock: {$r->stocks} | custom={$r->has_custom} bundle={$r->has_bundle}\n\n";
}

echo "=== PACKS / PERSONALIZABLES ===\n";
$packs = DB::table('productos as p')
    ->leftJoin('customization_fields as cf', 'cf.product_id', '=', 'p.idproducto')
    ->leftJoin('product_bundle_options as bo', 'bo.parent_product_id', '=', 'p.idproducto')
    ->where(function ($q) {
        $q->where('p.es_pack', true)
            ->orWhereNotNull('cf.id')
            ->orWhereNotNull('bo.id');
    })
    ->groupBy('p.idproducto', 'p.nombre', 'p.stock_actual', 'p.es_pack', 'p.veces_vendido', 'p.activo')
    ->select(
        'p.idproducto',
        'p.nombre',
        'p.stock_actual',
        'p.es_pack',
        'p.veces_vendido',
        'p.activo',
        DB::raw('count(distinct cf.id) as custom_fields'),
        DB::raw('count(distinct bo.id) as bundle_opts')
    )
    ->orderBy('p.nombre')
    ->orderByDesc('p.stock_actual')
    ->get();

foreach ($packs as $p) {
    echo "[{$p->idproducto}] {$p->nombre} stock={$p->stock_actual} vendido={$p->veces_vendido} pack={$p->es_pack} cf={$p->custom_fields} bo={$p->bundle_opts}\n";
}
