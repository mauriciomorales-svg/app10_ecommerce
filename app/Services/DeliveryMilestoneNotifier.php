<?php

namespace App\Services;

use App\Models\Venta;
use App\Support\CommerceMail;
use App\Support\OrderTrackingUrl;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DeliveryMilestoneNotifier
{
    /**
     * Avisos al comprador cuando cambia el mandado en JobsHours (WhatsApp + email opcional).
     */
    public static function onJobsHoursUpdate(
        Venta $venta,
        ?string $previousStatus,
        string $newStatus,
        ?string $paymentStatus = null
    ): void {
        if ((string) ($venta->fulfillment_type ?? 'pickup') !== 'delivery') {
            return;
        }

        $newStatus = strtolower(trim($newStatus));
        $previousStatus = $previousStatus ? strtolower(trim($previousStatus)) : null;

        if ($newStatus === $previousStatus) {
            return;
        }

        $url = DeliveryJobsHoursLinkService::buildCustomerUrl($venta);
        if (! $url) {
            return;
        }

        $order = $venta->numero_venta ?? $venta->idventa;
        $name = trim((string) ($venta->cliente_nombre ?? ''));
        $track = OrderTrackingUrl::signed((int) $venta->idventa);

        $messages = match ($newStatus) {
            'accepted', 'taken' => [
                'key' => 'assigned',
                'title' => 'Repartidor asignado',
                'wa' => ($name !== '' ? "Hola {$name}, " : 'Hola, ')
                    ."tu pedido DondeMorales #{$order} ya tiene repartidor en JobsHours. "
                    ."Pronto saldrá hacia tu dirección. JobsHours: {$url} · Estado: {$track}",
                'email_subject' => "DondeMorales — repartidor asignado (#{$order})",
            ],
            'in_progress' => [
                'key' => 'en_route',
                'title' => 'Tu envío va en camino',
                'wa' => ($name !== '' ? "Hola {$name}, " : 'Hola, ')
                    ."tu pedido DondeMorales #{$order} está en camino. "
                    ."Puedes seguir el estado en JobsHours: {$url}",
                'email_subject' => "DondeMorales — envío en camino (#{$order})",
            ],
            'completed' => [
                'key' => 'delivered',
                'title' => 'Pedido entregado',
                'wa' => ($name !== '' ? "Hola {$name}, " : 'Hola, ')
                    ."tu pedido DondeMorales #{$order} fue marcado como entregado en JobsHours. "
                    ."¡Gracias por comprar con nosotros! Resumen: {$track}",
                'email_subject' => "DondeMorales — pedido entregado (#{$order})",
            ],
            default => null,
        };

        if ($messages === null) {
            return;
        }

        $cacheKey = "dm_milestone:{$venta->idventa}:{$messages['key']}";
        if (Cache::has($cacheKey)) {
            return;
        }

        $phone = (string) ($venta->cliente_telefono ?? '');
        $wa = WhatsAppCloudNotifier::sendText($phone, $messages['wa']);

        $emailSent = false;
        $email = trim((string) ($venta->cliente_email ?? ''));
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) && CommerceMail::canSend()) {
            try {
                Mail::raw(
                    $messages['wa']."\n\n— DondeMorales",
                    fn ($m) => $m->to($email)->subject($messages['email_subject'])
                );
                $emailSent = true;
            } catch (\Throwable $e) {
                Log::warning('delivery_milestone.email_failed', [
                    'venta_id' => $venta->idventa,
                    'message' => $e->getMessage(),
                ]);
            }
        }

        Cache::put($cacheKey, 1, now()->addDays(14));

        Log::info('delivery_milestone.notified', [
            'venta_id' => $venta->idventa,
            'milestone' => $messages['key'],
            'jh_status' => $newStatus,
            'jh_payment' => $paymentStatus,
            'whatsapp_sent' => $wa['sent'],
            'email_sent' => $emailSent,
        ]);
    }
}
