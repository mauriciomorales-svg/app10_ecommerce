<?php

namespace App\Services;

use App\Models\Venta;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JobsHoursStoreDemandService
{
    public const STATUS_SKIPPED = 'skipped';
    public const STATUS_PENDING = 'pending';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_FAILED = 'failed';

    public static function publishForPaidVenta(Venta $venta, bool $force = false): bool
    {
        if (! config('delivery.jobshours.enabled')) {
            self::markSkipped($venta, 'integration_disabled');

            return false;
        }

        if ((string) ($venta->fulfillment_type ?? 'pickup') !== 'delivery') {
            self::markSkipped($venta, 'not_delivery');

            return false;
        }

        if ($venta->jobshours_request_id && ! $force) {
            return true;
        }

        $token = trim((string) config('delivery.jobshours.token', ''));
        if ($token === '') {
            self::markFailed($venta, 'missing_token');

            return false;
        }

        $lat = (float) $venta->delivery_lat;
        $lng = (float) $venta->delivery_lng;
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            self::markFailed($venta, 'invalid_coords');

            return false;
        }

        $venta->update([
            'jobshours_publish_status' => self::STATUS_PENDING,
            'jobshours_publish_attempts' => (int) ($venta->jobshours_publish_attempts ?? 0) + 1,
        ]);

        $storeLat = (float) config('delivery.store.lat');
        $storeLng = (float) config('delivery.store.lng');
        $pickupAddress = (string) config('packaging.pickup_address');
        $deliveryAddress = (string) ($venta->delivery_address ?? '');
        $amount = (int) round((float) ($venta->delivery_amount ?? 0));
        $orderRef = $venta->numero_venta ?? $venta->idventa;

        $description = sprintf(
            'Pedido DondeMorales #%s — retiro: %s. Entrega: %s. Cliente: %s, tel %s. Productos PAGADOS en tienda. Envío ref $%s — paga cliente en JobsHours.',
            $orderRef,
            $pickupAddress !== '' ? $pickupAddress : config('delivery.store.name'),
            $deliveryAddress !== '' ? $deliveryAddress : 'ver GPS',
            $venta->cliente_nombre ?? '—',
            $venta->cliente_telefono ?? '—',
            number_format($amount, 0, ',', '.')
        );
        $description = mb_substr($description, 0, 500);

        $buyerEmail = trim((string) ($venta->cliente_email ?? ''));

        $payload = [
            'external_order_id' => 'dm-'.$venta->idventa,
            'description' => $description,
            'lat' => $lat,
            'lng' => $lng,
            'type' => 'express_errand',
            'offered_price' => $amount > 0 ? $amount : null,
            'ttl_minutes' => (int) config('delivery.jobshours.ttl_minutes', 30),
            'store_name' => (string) config('delivery.store.name', 'DondeMorales'),
            'pickup_address' => $pickupAddress,
            'delivery_address' => $deliveryAddress,
            'pickup_lat' => $storeLat,
            'pickup_lng' => $storeLng,
            'delivery_lat' => $lat,
            'delivery_lng' => $lng,
            'items_count' => max(1, $venta->detalles()->count()),
            'buyer_email' => $buyerEmail !== '' ? $buyerEmail : null,
            'buyer_name' => trim((string) ($venta->cliente_nombre ?? '')) ?: null,
            'buyer_phone' => trim((string) ($venta->cliente_telefono ?? '')) ?: null,
        ];

        $categoryId = config('delivery.jobshours.category_id');
        if ($categoryId) {
            $payload['category_id'] = (int) $categoryId;
        }

        $base = rtrim((string) config('delivery.jobshours.api_url'), '/');
        $url = $base.'/api/v1/integrations/store-demand';

        try {
            $response = Http::timeout(20)
                ->withToken($token)
                ->acceptJson()
                ->post($url, array_filter($payload, fn ($v) => $v !== null));

            if (! $response->successful()) {
                $err = mb_substr((string) ($response->json('message') ?? $response->body()), 0, 500);
                self::markFailed($venta, 'http_'.$response->status().': '.$err);
                Log::warning('jobshours.store_demand.failed', [
                    'venta_id' => $venta->idventa,
                    'status' => $response->status(),
                    'body' => $response->json() ?? $response->body(),
                ]);

                return false;
            }

            $body = $response->json();
            $requestId = data_get($body, 'data.request_id');
            if ($requestId) {
                $venta->update([
                    'jobshours_request_id' => (int) $requestId,
                    'jobshours_publish_status' => self::STATUS_PUBLISHED,
                    'jobshours_publish_error' => null,
                ]);
            } else {
                self::markFailed($venta, 'missing_request_id_in_response');

                return false;
            }

            Log::info('jobshours.store_demand.ok', [
                'venta_id' => $venta->idventa,
                'request_id' => $requestId,
                'idempotent' => data_get($body, 'data.idempotent'),
            ]);

            $fresh = $venta->fresh();
            DeliveryFulfillmentNotifier::notifyAfterPublish($fresh);
            JobsHoursDeliveryStatusService::syncVenta($fresh);

            return true;
        } catch (\Throwable $e) {
            self::markFailed($venta, $e->getMessage());
            Log::error('jobshours.store_demand.exception', [
                'venta_id' => $venta->idventa,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public static function retryPending(): int
    {
        $maxAttempts = (int) config('delivery.jobshours.max_publish_attempts', 12);
        $cutoff = now()->subHours((int) config('delivery.jobshours.retry_hours', 48));

        $ventas = Venta::query()
            ->where('fulfillment_type', 'delivery')
            ->where('estado', 'pagado')
            ->whereNull('jobshours_request_id')
            ->where(function ($q) {
                $q->whereIn('jobshours_publish_status', [self::STATUS_PENDING, self::STATUS_FAILED])
                    ->orWhereNull('jobshours_publish_status');
            })
            ->where('jobshours_publish_attempts', '<', $maxAttempts)
            ->where('fecha_finalizada', '>=', $cutoff)
            ->orderBy('idventa')
            ->limit(30)
            ->get();

        $ok = 0;
        foreach ($ventas as $venta) {
            if (self::publishForPaidVenta($venta, force: ! $venta->jobshours_request_id)) {
                $ok++;
            }
        }

        return $ok;
    }

    private static function markSkipped(Venta $venta, string $reason): void
    {
        $venta->update([
            'jobshours_publish_status' => self::STATUS_SKIPPED,
            'jobshours_publish_error' => $reason,
        ]);
    }

    private static function markFailed(Venta $venta, string $error): void
    {
        $venta->update([
            'jobshours_publish_status' => self::STATUS_FAILED,
            'jobshours_publish_error' => mb_substr($error, 0, 2000),
        ]);
    }
}
