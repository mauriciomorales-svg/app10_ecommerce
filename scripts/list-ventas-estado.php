<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$rows = App\Models\Venta::query()
    ->selectRaw('estado, fulfillment_type, count(*) as c')
    ->groupBy('estado', 'fulfillment_type')
    ->orderByDesc('c')
    ->get();

foreach ($rows as $r) {
    echo "{$r->estado} | {$r->fulfillment_type} | {$r->c}\n";
}

$last = App\Models\Venta::orderByDesc('idventa')->limit(3)->get(['idventa', 'estado', 'fulfillment_type', 'created_at']);
echo "--- ultimas ---\n";
foreach ($last as $v) {
    echo "#{$v->idventa} {$v->estado} {$v->fulfillment_type} {$v->created_at}\n";
}
