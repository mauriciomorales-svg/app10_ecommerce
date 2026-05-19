<?php

$envFile = '/var/www/jobshour-api/.env';
$key = null;
foreach (file($envFile) as $line) {
    if (str_starts_with(trim($line), 'RESEND_API_KEY=')) {
        $key = trim(substr($line, strlen('RESEND_API_KEY=')), " \t\"'\r\n");
        break;
    }
}

if (! $key) {
    fwrite(STDERR, "no key\n");
    exit(1);
}

$body = json_encode([
    'from' => 'onboarding@resend.dev',
    'to' => ['mauricio.morales@usach.cl'],
    'subject' => 'DondeMorales prueba envio JobsHours',
    'html' => '<p>Hola Mauricio, prueba DondeMorales + JobsHours. <a href="https://jobshours.com/?request_id=12">Pagar envio</a></p>',
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

echo "key_len=".strlen($key)." body=".substr($body, 0, 80)."...\n";
echo "HTTP {$code}\n{$res}\n";
exit($code >= 200 && $code < 300 ? 0 : 1);
