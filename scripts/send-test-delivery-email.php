<?php

/**
 * Envío de prueba: recordatorio envío JobsHours.
 * Uso en servidor: php scripts/send-test-delivery-email.php mauricio.morales@usach.cl
 */

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$to = $argv[1] ?? 'mauricio.morales@usach.cl';

$venta = new App\Models\Venta([
    'idventa' => 99999,
    'numero_venta' => 99999,
    'cliente_nombre' => 'Mauricio (prueba)',
    'cliente_email' => $to,
    'cliente_telefono' => '+56900000000',
    'delivery_address' => 'Santiago Watt 205, Renaico — prueba',
    'delivery_amount' => 3500,
    'fulfillment_type' => 'delivery',
]);

$url = 'https://jobshours.com/?request_id=12&open_chat=1&source=dondemorales';

try {
    Illuminate\Support\Facades\Mail::to($to)->send(
        new App\Mail\DeliveryJobsHoursReminderMail($venta, $url, 3500)
    );
    echo "OK sent to {$to}\n";
    echo 'mailer='.config('mail.default')."\n";
} catch (Throwable $e) {
    fwrite(STDERR, 'FAIL: '.$e->getMessage()."\n");
    exit(1);
}
