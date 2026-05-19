<?php

namespace App\Support;

class OrderTicketUrl
{
    public static function signed(int $idventa, int $ttlSeconds = 86400): string
    {
        $expires = time() + $ttlSeconds;
        $sig = hash_hmac('sha256', "{$idventa}:{$expires}", (string) config('app.key'));
        $base = rtrim((string) config('app.url'), '/');

        return "{$base}/api/ordenes/{$idventa}/ticket?expires={$expires}&sig={$sig}";
    }
}
