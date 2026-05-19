<?php

namespace App\Services;

use App\Models\Venta;
use App\Support\OrderTicketUrl;
use App\Support\OrderTrackingUrl;

class PickupFulfillmentService
{
    public static function assignPickupCode(Venta $venta): Venta
    {
        if ($venta->codigo_retiro) {
            return $venta;
        }

        do {
            $code = strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));
        } while (Venta::where('codigo_retiro', $code)->exists());

        $venta->update([
            'codigo_retiro' => $code,
            'estado_retiro' => $venta->estado_retiro ?: 'pendiente_preparacion',
        ]);

        return $venta->fresh();
    }

    /**
     * @return array<string, mixed>
     */
    public static function ventaToPublicArray(Venta $venta): array
    {
        return [
            'idventa' => $venta->idventa,
            'estado' => $venta->estado,
            'total' => (int) round((float) $venta->total),
            'subtotal_productos' => (int) round((float) ($venta->subtotal_productos ?? 0)),
            'packaging_amount' => (int) round((float) ($venta->packaging_amount ?? 0)),
            'packaging_label' => $venta->packaging_label,
            'cliente_nombre' => $venta->cliente_nombre,
            'fecha_retiro' => $venta->fecha_retiro?->format('Y-m-d'),
            'fecha_retiro_label' => $venta->fecha_retiro
                ? $venta->fecha_retiro->format('d/m/Y')
                : null,
            'codigo_retiro' => $venta->codigo_retiro,
            'estado_retiro' => $venta->estado_retiro,
            'pickup_address' => config('packaging.pickup_address'),
            'pickup_hours' => config('packaging.pickup_hours'),
            'whatsapp' => config('packaging.whatsapp'),
            'ticket_url' => strtolower((string) $venta->estado) === 'pagado'
                ? OrderTicketUrl::signed((int) $venta->idventa)
                : null,
            'tracking_url' => strtolower((string) $venta->estado) === 'pagado'
                ? OrderTrackingUrl::signed((int) $venta->idventa)
                : null,
            'fulfillment_type' => $venta->fulfillment_type ?? 'pickup',
            'delivery_amount' => (int) round((float) ($venta->delivery_amount ?? 0)),
            'delivery_address' => $venta->delivery_address,
            'delivery_distance_km' => $venta->delivery_distance_km
                ? (float) $venta->delivery_distance_km
                : null,
            'jobshours_request_id' => $venta->jobshours_request_id,
            'jobshours_delivery_url' => DeliveryJobsHoursLinkService::buildCustomerUrl($venta),
            'jobshours_publish_status' => $venta->jobshours_publish_status,
            'jobshours_delivery_status' => $venta->jobshours_delivery_status,
            'jobshours_request_status' => $venta->jobshours_request_status,
            'jobshours_payment_status' => $venta->jobshours_payment_status,
            'jobshours_publish_error' => $venta->jobshours_publish_error,
            'whatsapp_delivery_url' => self::whatsappDeliveryUrl($venta),
        ];
    }

    private static function whatsappDeliveryUrl(Venta $venta): ?string
    {
        if ((string) ($venta->fulfillment_type ?? 'pickup') !== 'delivery') {
            return null;
        }

        $url = DeliveryJobsHoursLinkService::buildCustomerUrl($venta);
        if (! $url) {
            return null;
        }

        $amount = (int) round((float) ($venta->delivery_amount ?? 0));
        $msg = DeliveryFulfillmentNotifier::buildWhatsAppMessage($venta, $url, $amount);

        return WhatsAppCloudNotifier::waMeUrl((string) ($venta->cliente_telefono ?? ''), $msg);
    }
}
