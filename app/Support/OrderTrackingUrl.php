<?php

namespace App\Support;

class OrderTrackingUrl
{
    public static function signed(int $idventa, ?int $ttlSeconds = null): string
    {
        $ttl = $ttlSeconds ?? (int) config('commerce.tracking_ttl_seconds', 2_592_000);
        $expires = time() + $ttl;
        $sig = hash_hmac('sha256', "{$idventa}:{$expires}", (string) config('app.key'));
        $base = rtrim((string) env('FRONTEND_URL', 'https://www.dondemorales.cl'), '/');

        return "{$base}/seguimiento?id={$idventa}&expires={$expires}&sig={$sig}";
    }
}
