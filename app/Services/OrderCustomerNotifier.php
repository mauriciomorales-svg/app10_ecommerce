<?php

namespace App\Services;

use App\Mail\OrderPaidConfirmationMail;
use App\Models\Venta;
use App\Support\CommerceMail;
use App\Support\OrderTrackingUrl;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderCustomerNotifier
{
    public static function onOrderPaid(Venta $venta): void
    {
        $email = trim((string) ($venta->cliente_email ?? ''));
        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return;
        }

        if (! CommerceMail::canSend()) {
            Log::info('order_paid.email_skipped', [
                'venta_id' => $venta->idventa,
                'reason' => 'mail_not_configured',
            ]);

            return;
        }

        $trackingUrl = OrderTrackingUrl::signed((int) $venta->idventa);
        $jhUrl = DeliveryJobsHoursLinkService::buildCustomerUrl($venta);

        try {
            Mail::to($email)->send(new OrderPaidConfirmationMail($venta, $trackingUrl, $jhUrl));
            Log::info('order_paid.email_sent', ['venta_id' => $venta->idventa]);
        } catch (\Throwable $e) {
            Log::warning('order_paid.email_failed', [
                'venta_id' => $venta->idventa,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
