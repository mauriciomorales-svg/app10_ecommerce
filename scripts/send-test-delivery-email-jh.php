<?php

/**
 * Envío de prueba usando SMTP de jobshour-api (Gmail).
 * Uso: php send-test-delivery-email-jh.php destino@email.cl
 */

$to = $argv[1] ?? 'mauricio.morales@usach.cl';

require '/var/www/app10_ecommerce/vendor/autoload.php';
$app = require '/var/www/app10_ecommerce/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$jhEnv = '/var/www/jobshour-api/.env';
if (is_readable($jhEnv)) {
    foreach (file($jhEnv, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || ! str_contains($line, '=')) {
            continue;
        }
        [$k, $v] = explode('=', $line, 2);
        $k = trim($k);
        $v = trim($v, " \t\"'");
        if (str_starts_with($k, 'MAIL_')) {
            putenv("{$k}={$v}");
            $_ENV[$k] = $v;
            $_SERVER[$k] = $v;
        }
    }
}

config([
    'mail.default' => 'smtp',
    'mail.mailers.smtp' => [
        'transport' => 'smtp',
        'host' => env('MAIL_HOST', 'smtp.gmail.com'),
        'port' => (int) env('MAIL_PORT', 465),
        'encryption' => env('MAIL_ENCRYPTION', 'ssl'),
        'username' => env('MAIL_USERNAME'),
        'password' => env('MAIL_PASSWORD'),
        'timeout' => null,
    ],
    'mail.from' => [
        'address' => env('MAIL_FROM_ADDRESS', env('MAIL_USERNAME')),
        'name' => 'DondeMorales',
    ],
]);

$venta = new App\Models\Venta([
    'idventa' => 99999,
    'numero_venta' => 99999,
    'cliente_nombre' => 'Mauricio (prueba)',
    'cliente_email' => $to,
    'delivery_address' => 'Santiago Watt 205, Renaico',
    'delivery_amount' => 3500,
    'fulfillment_type' => 'delivery',
]);

$url = 'https://jobshours.com/?request_id=12&open_chat=1&source=dondemorales';

Illuminate\Support\Facades\Mail::mailer('smtp')->to($to)->send(
    new App\Mail\DeliveryJobsHoursReminderMail($venta, $url, 3500)
);

echo "OK sent to {$to} via Gmail SMTP\n";
