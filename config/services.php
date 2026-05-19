<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'flow' => [
        'api_key' => env('FLOW_API_KEY'),
        'secret_key' => env('FLOW_SECRET_KEY'),
        'sandbox' => env('FLOW_SANDBOX', false),
    ],

    'mercadopago' => [
        // Usar las mismas llaves que el resto del ecosistema (mi_ventas / inventario-api / jobshour-api)
        // (algunas apps usan MP_ACCESS_TOKEN como alias)
        'access_token' => env('MERCADOPAGO_ACCESS_TOKEN') ?: env('MP_ACCESS_TOKEN', ''),
        'webhook_secret' => env('MERCADOPAGO_WEBHOOK_SECRET', ''),
    ],

];
