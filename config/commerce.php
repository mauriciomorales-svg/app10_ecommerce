<?php

return [
    'default_store_slug' => env('COMMERCE_DEFAULT_STORE_SLUG', 'default'),
    'legacy_pos_ventas_api' => (bool) env('COMMERCE_LEGACY_POS_VENTAS_API', false),
    'ticket_require_signature' => (bool) env('COMMERCE_TICKET_REQUIRE_SIGNATURE', true),
    'tracking_ttl_seconds' => (int) env('COMMERCE_TRACKING_TTL_SECONDS', 2_592_000),
    'min_order_products' => (int) env('COMMERCE_MIN_ORDER_PRODUCTS', 5000),
];
