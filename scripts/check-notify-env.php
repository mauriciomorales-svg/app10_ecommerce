<?php
/**
 * Uso en servidor: php scripts/check-notify-env.php
 * No imprime secretos, solo si están configurados.
 */
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

function line(string $label, ?string $value): void
{
    $v = trim((string) $value);
    if ($v === '' || strtolower($v) === 'null') {
        echo "{$label}: NO\n";

        return;
    }
    echo "{$label}: SI (".strlen($v)." chars)\n";
}

echo "=== WhatsApp Cloud API ===\n";
line('WHATSAPP_ACCESS_TOKEN', config('delivery.whatsapp.access_token'));
line('WHATSAPP_PHONE_NUMBER_ID', config('delivery.whatsapp.phone_number_id'));
echo 'WHATSAPP_API_VERSION: '.config('delivery.whatsapp.api_version')."\n";
echo 'WhatsAppCloudNotifier::isConfigured: '.(App\Services\WhatsAppCloudNotifier::isConfigured() ? 'SI' : 'NO')."\n";

echo "\n=== Correo (Laravel Mail) ===\n";
echo 'MAIL_MAILER: '.config('mail.default')."\n";
line('MAIL_HOST', config('mail.mailers.smtp.host'));
line('MAIL_USERNAME', config('mail.mailers.smtp.username'));
line('MAIL_PASSWORD', config('mail.mailers.smtp.password'));
echo 'MAIL_FROM_ADDRESS: '.config('mail.from.address')."\n";
echo 'MAIL_FROM_NAME: '.config('mail.from.name')."\n";

echo "\n=== Resend (alternativo) ===\n";
line('RESEND_API_KEY', config('services.resend.key'));

echo "\n=== JobsHours integración ===\n";
$jh = config('delivery.jobshours');
echo 'JOBSHOURS_STORE_DEMAND_ENABLED: '.(($jh['enabled'] ?? false) ? 'SI' : 'NO')."\n";
line('JOBSHOURS_STORE_DEMAND_TOKEN', $jh['token'] ?? null);
echo 'JOBSHOURS_API_URL: '.($jh['api_url'] ?? '')."\n";
echo 'JOBSHOURS_WEB_URL: '.($jh['web_url'] ?? '')."\n";
line('DELIVERY_ALERT_EMAIL', config('delivery.notifications.store_alert_email'));
