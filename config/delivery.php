<?php

return [
    'store' => [
        'lat' => (float) env('DELIVERY_STORE_LAT', -37.6672),
        'lng' => (float) env('DELIVERY_STORE_LNG', -72.5730),
        'name' => env('DELIVERY_STORE_NAME', 'DondeMorales'),
    ],

  /*
   * Tarifas referencia Renaico (CLP).
   * Misma comuna ~$2.000; km extra configurable.
   */
    'pricing' => [
        'base_commune_clp' => (int) env('DELIVERY_BASE_COMMUNE_CLP', 2000),
        'included_km' => (float) env('DELIVERY_INCLUDED_KM', 3),
        'per_extra_km_clp' => (int) env('DELIVERY_PER_EXTRA_KM_CLP', 600),
        'min_clp' => (int) env('DELIVERY_MIN_CLP', 2000),
        'max_clp' => (int) env('DELIVERY_MAX_CLP', 12000),
        'round_to' => (int) env('DELIVERY_ROUND_TO', 100),
        'road_factor' => (float) env('DELIVERY_ROAD_FACTOR', 1.15),
        'max_radius_km' => (float) env('DELIVERY_MAX_RADIUS_KM', 18),
    ],

    'geocode' => [
        'enabled' => (bool) env('DELIVERY_GEOCODE_ENABLED', true),
        'nominatim_url' => env('DELIVERY_NOMINATIM_URL', 'https://nominatim.openstreetmap.org/search'),
        'default_city' => env('DELIVERY_GEOCODE_CITY', 'Renaico, Araucanía, Chile'),
        'user_agent' => env('DELIVERY_GEOCODE_USER_AGENT', 'DondeMorales-Ecommerce/1.0'),
    ],

    'jobshours' => [
        // Tras pago de productos en DondeMorales: POST store-demand → pin en mapa JobsHours.
        'enabled' => (bool) env('JOBSHOURS_STORE_DEMAND_ENABLED', false),
        'web_url' => rtrim((string) env('JOBSHOURS_WEB_URL', 'https://jobshours.com'), '/'),
        'return_url' => env('JOBSHOURS_DELIVERY_RETURN_URL'),
        'api_url' => rtrim((string) env('JOBSHOURS_API_URL', 'https://jobshours.com'), '/'),
        'token' => env('JOBSHOURS_STORE_DEMAND_TOKEN'),
        'category_id' => env('JOBSHOURS_STORE_DEMAND_CATEGORY_ID') !== null
            ? (int) env('JOBSHOURS_STORE_DEMAND_CATEGORY_ID')
            : null,
        'ttl_minutes' => (int) env('JOBSHOURS_STORE_DEMAND_TTL', 30),
        'max_publish_attempts' => (int) env('JOBSHOURS_MAX_PUBLISH_ATTEMPTS', 12),
        'retry_hours' => (int) env('JOBSHOURS_RETRY_HOURS', 48),
        'status_sync_days' => (int) env('JOBSHOURS_STATUS_SYNC_DAYS', 7),
    ],

    'whatsapp' => [
        'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'api_version' => env('WHATSAPP_API_VERSION', 'v18.0'),
    ],

    'notifications' => [
        'store_alert_email' => env('DELIVERY_ALERT_EMAIL'),
    ],
];
