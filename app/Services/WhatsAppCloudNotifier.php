<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppCloudNotifier
{
    public static function isConfigured(): bool
    {
        return trim((string) config('delivery.whatsapp.access_token', '')) !== ''
            && trim((string) config('delivery.whatsapp.phone_number_id', '')) !== '';
    }

    /**
     * @return array{sent: bool, error: string|null}
     */
    public static function sendText(string $phone, string $message): array
    {
        if (! self::isConfigured()) {
            return ['sent' => false, 'error' => 'whatsapp_not_configured'];
        }

        $to = self::formatPhone($phone);
        if ($to === null) {
            return ['sent' => false, 'error' => 'invalid_phone'];
        }

        $version = config('delivery.whatsapp.api_version', 'v18.0');
        $phoneId = config('delivery.whatsapp.phone_number_id');
        $url = sprintf(
            'https://graph.facebook.com/%s/%s/messages',
            $version,
            $phoneId
        );

        try {
            $response = Http::timeout(15)
                ->withToken((string) config('delivery.whatsapp.access_token'))
                ->post($url, [
                    'messaging_product' => 'whatsapp',
                    'to' => $to,
                    'type' => 'text',
                    'text' => ['body' => mb_substr($message, 0, 4000)],
                ]);

            if ($response->successful()) {
                return ['sent' => true, 'error' => null];
            }

            Log::warning('whatsapp.send_failed', [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            return ['sent' => false, 'error' => 'api_error_'.$response->status()];
        } catch (\Throwable $e) {
            Log::error('whatsapp.send_exception', ['message' => $e->getMessage()]);

            return ['sent' => false, 'error' => $e->getMessage()];
        }
    }

    public static function waMeUrl(string $phone, string $message): ?string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';
        if ($digits === '') {
            return null;
        }

        return 'https://wa.me/'.$digits.'?text='.rawurlencode($message);
    }

    private static function formatPhone(string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';
        if ($digits === '') {
            return null;
        }
        if (str_starts_with($digits, '56') && strlen($digits) >= 11) {
            return $digits;
        }
        if (strlen($digits) === 9 && $digits[0] === '9') {
            return '56'.$digits;
        }
        if (strlen($digits) >= 10) {
            return $digits;
        }

        return null;
    }
}
