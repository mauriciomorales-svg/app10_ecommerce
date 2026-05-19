<?php

namespace App\Services;

use App\Models\Venta;

class DeliveryJobsHoursLinkService
{
    /**
     * Enlace para que el comprador abra JobsHours (pago del mandado / chat).
     * Si ya hay request_id de store-demand, usa deep link directo; si no, pubdemanda precargado.
     */
    public static function buildCustomerUrl(Venta $venta): ?string
    {
        if ((string) ($venta->fulfillment_type ?? 'pickup') !== 'delivery') {
            return null;
        }

        $requestId = (int) ($venta->jobshours_request_id ?? 0);
        if ($requestId > 0) {
            $base = rtrim((string) config('delivery.jobshours.web_url', 'https://jobshours.com'), '/');

            return $base.'/?'.http_build_query([
                'request_id' => (string) $requestId,
                'open_chat' => '1',
                'source' => 'dondemorales',
            ], '', '&', PHP_QUERY_RFC3986);
        }

        return self::buildPubdemandaFallbackUrl($venta);
    }

    public static function buildPubdemandaFallbackUrl(Venta $venta): ?string
    {
        if ((string) ($venta->fulfillment_type ?? 'pickup') !== 'delivery') {
            return null;
        }

        $lat = (float) $venta->delivery_lat;
        $lng = (float) $venta->delivery_lng;
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            return null;
        }

        $amount = (int) round((float) ($venta->delivery_amount ?? 0));
        $pickup = (string) config('packaging.pickup_address');
        $deliveryAddress = (string) ($venta->delivery_address ?? '');
        $storeName = (string) config('delivery.store.name', 'DondeMorales');
        $orderRef = $venta->numero_venta ?? $venta->idventa;

        $description = sprintf(
            'Envío pedido DondeMorales #%s. Retiro: %s. Entrega: %s. Productos ya pagados en la tienda.',
            $orderRef,
            $pickup !== '' ? $pickup : $storeName,
            $deliveryAddress !== '' ? $deliveryAddress : 'ver mapa'
        );
        if ($amount > 0) {
            $description .= sprintf(' Tarifa referencia $%s.', number_format($amount, 0, ',', '.'));
        }

        $base = rtrim((string) config('delivery.jobshours.web_url', 'https://jobshours.com'), '/');
        $params = [
            'pubdemanda' => '1',
            'lat' => (string) $lat,
            'lng' => (string) $lng,
            'tipo' => 'mandado',
            'tienda' => $storeName,
            'source' => 'dondemorales',
            'q' => mb_substr($description, 0, 500),
        ];

        if ($pickup !== '') {
            $params['origen'] = $pickup;
        }
        if ($deliveryAddress !== '') {
            $params['destino'] = $deliveryAddress;
        }

        $returnUrl = trim((string) config('delivery.jobshours.return_url', ''));
        if ($returnUrl !== '') {
            $params['return'] = $returnUrl;
        }

        return $base.'/?'.http_build_query($params, '', '&', PHP_QUERY_RFC3986);
    }
}
