<?php

namespace App\Support;

use App\Models\CommerceStore;

/**
 * Tienda de comercio activa en el request actual (multi‑instancia / plantilla premium).
 */
final class CurrentCommerceStore
{
    private static ?CommerceStore $store = null;

    public static function set(?CommerceStore $store): void
    {
        self::$store = $store;
    }

    public static function get(): ?CommerceStore
    {
        return self::$store;
    }

    public static function id(): ?int
    {
        return self::$store?->id;
    }

    public static function forget(): void
    {
        self::$store = null;
    }
}
