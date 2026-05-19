<?php

return [
    'store_name' => env('PACKAGING_STORE_NAME', 'Donde Morales'),
    'pickup_address' => env('PACKAGING_PICKUP_ADDRESS', 'Santiago Watt 205, Renaico, Araucanía'),
    'pickup_hours' => env('PACKAGING_PICKUP_HOURS', 'Lun–Dom 9:00–21:00'),
    'whatsapp' => env('PACKAGING_WHATSAPP', '+56976647756'),

    /** Subtotal productos (CLP) desde el cual la bolsa reforzada pasa a $0 */
    'free_reinforced_from' => (int) env('PACKAGING_FREE_REINFORCED_FROM', 10000),

    /** Subtotal desde el cual la caja regalo pasa a $0 (si eligieron caja) */
    'free_gift_box_from' => (int) env('PACKAGING_FREE_GIFT_BOX_FROM', 25000),

    'options' => [
        'none' => [
            'label' => 'Traigo mi bolsa (sin cargo)',
            'description' => 'Ideal si ya tienes bolsa. Mostramos tu código al retirar.',
            'amount' => 0,
            'barcode' => 'PACK-NONE',
            'recommended' => false,
        ],
        'standard' => [
            'label' => 'Bolsa estándar',
            'description' => 'Para la mayoría de las compras del día.',
            'amount' => (int) env('PACKAGING_PRICE_STANDARD', 290),
            'barcode' => 'PACK-STD',
            'recommended' => true,
        ],
        'reinforced' => [
            'label' => 'Bolsa reforzada',
            'description' => 'Bebidas, enlatados o pedido pesado.',
            'amount' => (int) env('PACKAGING_PRICE_REINFORCED', 590),
            'barcode' => 'PACK-REINF',
            'recommended' => false,
        ],
        'gift_box' => [
            'label' => 'Caja regalo',
            'description' => 'Presentación premium para regalos.',
            'amount' => (int) env('PACKAGING_PRICE_GIFT_BOX', 1490),
            'barcode' => 'PACK-GIFT',
            'recommended' => false,
        ],
    ],
];
