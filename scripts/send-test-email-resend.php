<?php

$to = $argv[1] ?? 'mauricio.morales@usach.cl';

require '/var/www/jobshour-api/vendor/autoload.php';
$app = require '/var/www/jobshour-api/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$subject = 'DondeMorales — prueba: completa el pago de tu envío en JobsHours';
$url = 'https://jobshours.com/?request_id=12&open_chat=1&source=dondemorales';
$html = <<<HTML
<div style="font-family:system-ui,sans-serif;max-width:520px">
  <h1 style="color:#16a34a">Pedido #99999 pagado (prueba)</h1>
  <p>Hola Mauricio,</p>
  <p>Los <strong>productos</strong> ya están confirmados en DondeMorales.</p>
  <p>Falta pagar el <strong>envío (~$3.500)</strong> en JobsHours:</p>
  <p><a href="{$url}" style="background:#d97706;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Pagar envío en JobsHours</a></p>
  <p style="color:#666;font-size:13px">Destino prueba: Santiago Watt 205, Renaico</p>
</div>
HTML;
$html = str_replace('</div>', '</div>', $html);
$html = str_replace('</div>', '</div>', $html);

Illuminate\Support\Facades\Mail::html($html, function ($message) use ($to, $subject) {
    $message->to($to)->subject($subject);
});

echo "OK sent to {$to} via ".config('mail.default')."\n";
