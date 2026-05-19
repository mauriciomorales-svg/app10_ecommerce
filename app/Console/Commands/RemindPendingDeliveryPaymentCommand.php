<?php

namespace App\Console\Commands;

use App\Models\Venta;
use App\Services\DeliveryFulfillmentNotifier;
use App\Services\DeliveryJobsHoursLinkService;
use App\Services\JobsHoursDeliveryStatusService;
use App\Services\WhatsAppCloudNotifier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RemindPendingDeliveryPaymentCommand extends Command
{
    protected $signature = 'commerce:remind-pending-delivery-payment {--hours=2 : Horas desde la publicación}';

    protected $description = 'WhatsApp/email recordatorio si el envío en JobsHours sigue sin pagar';

    public function handle(): int
    {
        $hours = max(1, (int) $this->option('hours'));
        $cutoff = now()->subHours($hours);

        $ventas = Venta::query()
            ->where('fulfillment_type', 'delivery')
            ->where('estado', 'pagado')
            ->whereNotNull('jobshours_request_id')
            ->where('jobshours_publish_status', 'published')
            ->where(function ($q) {
                $q->whereNull('jobshours_payment_status')
                    ->orWhere('jobshours_payment_status', '!=', 'completed');
            })
            ->where('delivery_notified_at', '<=', $cutoff)
            ->whereNotIn('jobshours_request_status', ['completed', 'cancelled'])
            ->orderByDesc('idventa')
            ->limit(40)
            ->get();

        $sent = 0;

        foreach ($ventas as $venta) {
            JobsHoursDeliveryStatusService::syncVenta($venta->fresh());
            $venta->refresh();

            if ((string) ($venta->jobshours_payment_status ?? '') === 'completed') {
                continue;
            }

            if (in_array((string) ($venta->jobshours_request_status ?? ''), ['completed', 'cancelled'], true)) {
                continue;
            }

            $cacheKey = 'dm_delivery_pay_remind:'.$venta->idventa;
            if (Cache::has($cacheKey)) {
                continue;
            }

            $url = DeliveryJobsHoursLinkService::buildCustomerUrl($venta);
            if (! $url) {
                continue;
            }

            $amount = (int) round((float) ($venta->delivery_amount ?? 0));
            $msg = DeliveryFulfillmentNotifier::buildWhatsAppMessage($venta, $url, $amount)
                .' Te recordamos completar el pago del envío cuando puedas.';

            $wa = WhatsAppCloudNotifier::sendText((string) ($venta->cliente_telefono ?? ''), $msg);

            Cache::put($cacheKey, 1, now()->addHours(24));
            $sent++;

            Log::info('delivery_payment_reminder.sent', [
                'venta_id' => $venta->idventa,
                'whatsapp_sent' => $wa['sent'],
            ]);
        }

        $this->info("Recordatorios enviados: {$sent}");

        return self::SUCCESS;
    }
}
