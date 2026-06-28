<?php

namespace App\Console\Commands;

use App\Services\WhatsAppCloudNotifier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class WhatsAppConfigCheckCommand extends Command
{
    protected $signature = 'commerce:whatsapp-check
                            {--test= : Enviar mensaje de prueba a teléfono Chile (ej. 56976647756)}';

    protected $description = 'Verifica WHATSAPP_* en .env y conexión con Graph API (Meta)';

    public function handle(): int
    {
        $token = trim((string) config('delivery.whatsapp.access_token', ''));
        $phoneId = trim((string) config('delivery.whatsapp.phone_number_id', ''));
        $version = config('delivery.whatsapp.api_version', 'v18.0');
        $packaging = config('packaging.whatsapp');

        $this->info('=== WhatsApp Cloud API — DondeMorales ===');
        $this->line('PACKAGING_WHATSAPP (wa.me tienda): '.($packaging ?: '(vacío)'));
        $this->line('WHATSAPP_ACCESS_TOKEN: '.($token !== '' ? 'configurado ('.strlen($token).' chars)' : 'NO'));
        $this->line('WHATSAPP_PHONE_NUMBER_ID: '.($phoneId !== '' ? $phoneId : 'NO'));
        $this->line('WHATSAPP_API_VERSION: '.$version);
        $this->line('WhatsAppCloudNotifier::isConfigured: '.(WhatsAppCloudNotifier::isConfigured() ? 'SI' : 'NO'));

        if (! WhatsAppCloudNotifier::isConfigured()) {
            $this->newLine();
            $this->warn('La API no está lista. Sigue docs/WHATSAPP-CLOUD-API.md');
            $this->line('Negocio Meta verificado ≠ token en servidor. Son pasos distintos.');

            return self::FAILURE;
        }

        $url = sprintf('https://graph.facebook.com/%s/%s', $version, $phoneId);
        $response = Http::timeout(15)
            ->withToken($token)
            ->get($url, ['fields' => 'display_phone_number,verified_name,quality_rating']);

        if (! $response->successful()) {
            $this->error('Graph API rechazó la consulta del número.');
            $this->line('HTTP '.$response->status());
            $body = $response->json();
            if (is_array($body)) {
                $this->line(json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }

            return self::FAILURE;
        }

        $data = $response->json();
        $this->newLine();
        $this->info('Número vinculado en Meta (Cloud API):');
        $this->line('  Nombre verificado: '.($data['verified_name'] ?? '—'));
        $this->line('  Teléfono mostrado: '.($data['display_phone_number'] ?? '—'));
        $this->line('  Calidad: '.($data['quality_rating'] ?? '—'));

        $test = $this->option('test');
        if ($test) {
            $this->newLine();
            $this->info('Enviando mensaje de prueba a '.$test.'…');
            $result = WhatsAppCloudNotifier::sendText(
                (string) $test,
                'DondeMorales — prueba API WhatsApp. Si recibes esto, la notificación automática de pedidos está lista.'
            );
            if ($result['sent']) {
                $this->info('Mensaje enviado correctamente.');

                return self::SUCCESS;
            }
            $this->error('No se pudo enviar: '.($result['error'] ?? 'error'));

            return self::FAILURE;
        }

        $this->newLine();
        $this->line('Opcional: php artisan commerce:whatsapp-check --test=569XXXXXXXX');

        return self::SUCCESS;
    }
}
