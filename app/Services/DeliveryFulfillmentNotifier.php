<?php

namespace App\Services;

use App\Mail\DeliveryJobsHoursReminderMail;
use App\Models\Venta;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DeliveryFulfillmentNotifier
{
    public static function notifyAfterPublish(Venta $venta): void
    {
        if ((string) ($venta->fulfillment_type ?? 'pickup') !== 'delivery') {
            return;
        }

        if ($venta->delivery_notified_at) {
            return;
        }

        if (! $venta->jobshours_request_id) {
            return;
        }

        $url = DeliveryJobsHoursLinkService::buildCustomerUrl($venta);
        if (! $url) {
            return;
        }

        $amount = (int) round((float) ($venta->delivery_amount ?? 0));
        $message = self::buildWhatsAppMessage($venta, $url, $amount);

        $emailSent = self::sendEmail($venta, $url, $amount);
        $waResult = WhatsAppCloudNotifier::sendText((string) ($venta->cliente_telefono ?? ''), $message);

        $venta->update(['delivery_notified_at' => now()]);

        Log::info('delivery_fulfillment.notified', [
            'venta_id' => $venta->idventa,
            'email_sent' => $emailSent,
            'whatsapp_sent' => $waResult['sent'],
            'whatsapp_error' => $waResult['error'],
        ]);
    }

    private static function sendEmail(Venta $venta, string $url, int $amount): bool
    {
        $email = trim((string) ($venta->cliente_email ?? ''));
        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        try {
            Mail::to($email)->send(new DeliveryJobsHoursReminderMail($venta, $url, $amount));

            return true;
        } catch (\Throwable $e) {
            Log::warning('delivery_fulfillment.email_failed', [
                'venta_id' => $venta->idventa,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public static function buildWhatsAppMessage(Venta $venta, string $url, int $amount): string
    {
        $order = $venta->numero_venta ?? $venta->idventa;
        $name = trim((string) ($venta->cliente_nombre ?? ''));
        $greet = $name !== '' ? "Hola {$name}" : 'Hola';

        return "{$greet}, tu pedido DondeMorales #{$order} ya está pagado (productos confirmados). "
            .'Falta 1 paso: paga el envío (~$'.number_format($amount, 0, ',', '.').') en JobsHours: '
            .$url;
    }
}
