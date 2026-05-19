<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Payment Provider Switches
    |--------------------------------------------------------------------------
    |
    | Encendido/apagado por proveedor para operar de forma controlada
    | sin eliminar rutas ni controladores.
    |
    */
    'providers' => [
        'flow' => [
            'enabled' => env('PAYMENTS_FLOW_ENABLED', true),
        ],
        'mp_online' => [
            // Por defecto apagado: activar cuando MERCADOPAGO_ACCESS_TOKEN esté en producción
            'enabled' => env('PAYMENTS_MP_ONLINE_ENABLED', false),
        ],
    ],
];

