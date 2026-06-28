<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$v = App\Models\Venta::where('estado', 'pagado')->orderByDesc('idventa')->first();
if (! $v) {
    echo "NO_PAID_VENTA\n";
    exit(0);
}

echo 'VENTA_ID='.$v->idventa."\n";
echo 'FULFILLMENT='.($v->fulfillment_type ?? 'pickup')."\n";
echo 'TRACK_URL='.App\Support\OrderTrackingUrl::signed((int) $v->idventa, 3600)."\n";
