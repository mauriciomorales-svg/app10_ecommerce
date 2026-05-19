<?php

$to = $argv[1] ?? 'mauricio.morales@usach.cl';
$envFile = $argv[2] ?? '/var/www/jobshour-api/.env';

$key = null;
foreach (file($envFile) as $line) {
    if (str_starts_with(trim($line), 'RESEND_API_KEY=')) {
        $key = trim(substr($line, strlen('RESEND_API_KEY=')), " \t\"'\r\n");
        break;
    }
}

if (! $key) {
    fwrite(STDERR, "RESEND_API_KEY not found\n");
    exit(1);
}

$url = 'https://jobshours.com/?request_id=12&open_chat=1&source=dondemorales';
$html = '<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">'
    .'<h1 style="color:#16a34a">Tu pedido #99999 esta pagado (prueba)</h1>'
    .'<p>Hola Mauricio,</p>'
    .'<p>Los <strong>productos</strong> ya estan confirmados en DondeMorales.</p>'
    .'<p>Falta pagar el <strong>envio (~$3.500)</strong> en JobsHours:</p>'
    .'<p style="margin:24px 0"><a href="'.$url.'" style="background:#d97706;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Pagar envio en JobsHours</a></p>'
    .'<p style="font-size:14px;color:#555">Destino: Santiago Watt 205, Renaico</p></div>';

$body = json_encode([
    'from' => 'onboarding@resend.dev',
    'to' => [$to],
    'subject' => 'DondeMorales - completa el pago de tu envio en JobsHours (prueba)',
    'html' => $html,
]);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer '.$key,
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_TIMEOUT => 30,
]);
$res = curl_exec($ch);
$code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP {$code}\n{$res}\n";
exit($code >= 200 && $code < 300 ? 0 : 1);
