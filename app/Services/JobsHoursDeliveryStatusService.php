<?php

namespace App\Services;

use App\Models\Venta;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JobsHoursDeliveryStatusService
{
    public static function syncVenta(Venta $venta): bool
    {
        $requestId = (int) ($venta->jobshours_request_id ?? 0);
        if ($requestId <= 0) {
            return false;
        }

        $token = trim((string) config('delivery.jobshours.token', ''));
        if ($token === '') {
            return false;
        }

        $base = rtrim((string) config('delivery.jobshours.api_url'), '/');
        $url = $base.'/api/v1/integrations/service-request/'.$requestId;

        try {
            $response = Http::timeout(15)
                ->withToken($token)
                ->acceptJson()
                ->get($url);

            if (! $response->successful()) {
                return false;
            }

            $status = (string) data_get($response->json(), 'data.status', '');
            $label = (string) data_get($response->json(), 'data.status_label', $status);
            $paymentStatus = data_get($response->json(), 'data.payment_status');

            if ($status === '') {
                return false;
            }

            $previousStatus = (string) ($venta->jobshours_request_status ?? '');

            $venta->update([
                'jobshours_delivery_status' => $label !== '' ? $label : $status,
                'jobshours_request_status' => $status,
                'jobshours_payment_status' => is_string($paymentStatus) ? $paymentStatus : null,
                'jobshours_status_synced_at' => now(),
            ]);

            self::mapEstadoRetiro($venta, $status);

            DeliveryMilestoneNotifier::onJobsHoursUpdate(
                $venta->fresh(),
                $previousStatus !== '' ? $previousStatus : null,
                $status,
                is_string($paymentStatus) ? $paymentStatus : null
            );

            return true;
        } catch (\Throwable $e) {
            Log::debug('jobshours.status_sync_failed', [
                'venta_id' => $venta->idventa,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private static function mapEstadoRetiro(Venta $venta, string $jhStatus): void
    {
        $map = [
            'pending' => 'envio_solicitado',
            'accepted' => 'envio_asignado',
            'in_progress' => 'envio_en_camino',
            'completed' => 'envio_entregado',
            'cancelled' => 'envio_cancelado',
        ];

        $estado = $map[$jhStatus] ?? null;
        if ($estado === null) {
            return;
        }

        $venta->update(['estado_retiro' => $estado]);
    }

    public static function syncPending(): int
    {
        $maxAgeDays = (int) config('delivery.jobshours.status_sync_days', 7);
        $cutoff = now()->subDays($maxAgeDays);

        $ventas = Venta::query()
            ->where('fulfillment_type', 'delivery')
            ->where('estado', 'pagado')
            ->whereNotNull('jobshours_request_id')
            ->where('fecha_finalizada', '>=', $cutoff)
            ->orderByDesc('idventa')
            ->limit(80)
            ->get();

        $n = 0;
        foreach ($ventas as $venta) {
            if (self::syncVenta($venta)) {
                $n++;
            }
        }

        return $n;
    }
}
