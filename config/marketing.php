<?php

return [
    'meta_pixel_id' => env('META_PIXEL_ID', ''),

    'weekly_offer' => [
        'enabled' => (bool) env('MARKETING_WEEKLY_OFFER_ENABLED', true),
        'title' => env('MARKETING_WEEKLY_OFFER_TITLE', 'Combo Toppi\'s exclusivo web'),
        'subtitle' => env('MARKETING_WEEKLY_OFFER_SUBTITLE', 'Esta semana en dondemorales.cl — retiro o envío en Renaico'),
        'href' => env('MARKETING_WEEKLY_OFFER_HREF', '/helados'),
        'coupon' => env('MARKETING_WEEKLY_OFFER_COUPON', 'MORALESWEB10'),
        'badge' => env('MARKETING_WEEKLY_OFFER_BADGE', 'Solo en la web'),
    ],
];
