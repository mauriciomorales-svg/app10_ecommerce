<?php

/**
 * Mensajes web — reparto Renaico (DondeMorales propio + referencia JobsHours).
 * No es tarifario: las tarifas viven en config/delivery.php.
 */
return [
    'activo' => true,

    'headline' => 'Reparto a domicilio en Renaico',
    'subheadline' => 'Pedido con fecha · ventanas fijas · ideal para packs y combos cocina',
    'badge' => 'Llegamos a tu casa',

    'retiro' => [
        'direccion' => 'Santiago Watt 205, Renaico',
        'horario' => 'Lun–Dom 9:00 a 21:00',
        'nota' => 'Retiro gratis con tu código tras pagar online.',
    ],

    /** Recomendación comercial (no bloquea checkout salvo min_order_products global) */
    'min_pedido_delivery_clp' => 12000,
    'min_pedido_delivery_nota' => 'Combos y packs desde $12.000 — cubren el viaje y la preparación.',

    'ventanas' => [
        [
            'nombre' => 'Almuerzo',
            'horario' => '12:30 – 14:00',
            'dias' => 'Mar–Dom (según tanda confirmada)',
        ],
        [
            'nombre' => 'Cena',
            'horario' => '19:00 – 20:30',
            'dias' => 'Vie–Dom (combos cocina y packs)',
        ],
    ],

    'pasos' => [
        ['titulo' => 'Elige pack o combo', 'texto' => 'Regalo, cocina a pedido o chorrillana para compartir.'],
        ['titulo' => 'Paga y agenda fecha', 'texto' => 'Checkout online · indicas retiro o envío.'],
        ['titulo' => 'Te avisamos la ventana', 'texto' => 'Confirmación por WhatsApp con hora estimada.'],
    ],

    'destacados' => [
        [
            'titulo' => 'Packs regalo',
            'detalle' => 'Envío gratis en Renaico',
            'href' => '/packs',
            'precio_desde' => null,
        ],
        [
            'titulo' => 'Cocina de la casa',
            'detalle' => 'Listo o kit para cocinar · top Facebook zona',
            'href' => '/cocina-casa',
            'precio_desde' => 3500,
        ],
        [
            'titulo' => 'Chorrillana + bebida',
            'detalle' => 'Ideal para compartir en casa',
            'href' => '/salada',
            'precio_desde' => 11500,
        ],
    ],

    'whatsapp' => '56975647756',
];
