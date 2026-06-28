<?php

/**
 * Combos helados — precios REALES alineados a mostrador (mayo 2026).
 *
 * Soft: vainilla, chocolate o sabor mixto · cono $1.000 / $1.800
 * Artesanal: $2.000 / $3.500 · Yogurt con fruta: $2.800 · Combos yogurt: $2.990–$3.790
 */
return [
    'title' => 'Helados Toppi\'s',
    'tagline' => 'Combos de helado de yogurt desde $2.990 · o arma helado soft, de yogurt o artesanal',
    'subtitle' => 'Combo: helado de yogurt listo · Armar: soft $1.000 · yogurt $2.800 · artesanal $2.000',
    'categoria_nombre' => 'Helados Toppi\'s',
    'categoria_id' => (int) env('HELADOS_CATEGORIA_ID', 24),

    'combos' => [
        [
            'nombre' => 'Copa Crunchy Biscoff Toppi\'s',
            'badge' => 'Best seller',
            'concepto' => 'Para llevar',
            'descripcion_corta' => 'Yogurt + speculoos, almendras y caramelo salado. Vaso con tapa.',
            'gradient' => 'from-amber-900/90 via-orange-950/80 to-yellow-900/70',
            'imagen' => '/images/helados/copa-biscoff.png',
        ],
        [
            'nombre' => 'Copa Antioxidante Tropical Toppi\'s',
            'badge' => 'Saludable',
            'concepto' => 'Para llevar',
            'descripcion_corta' => 'Yogurt + mango, kiwi, granola y miel. Vaso con tapa.',
            'gradient' => 'from-emerald-700/90 via-teal-800/80 to-lime-900/70',
            'imagen' => '/images/helados/copa-tropical.png',
        ],
        [
            'nombre' => 'Copa Cheesecake Berries Toppi\'s',
            'badge' => 'Instagram',
            'concepto' => 'Para llevar',
            'descripcion_corta' => 'Yogurt + frutillas, arándanos, galleta y salsa frutos rojos.',
            'gradient' => 'from-fuchsia-800/90 via-rose-900/80 to-red-950/70',
            'imagen' => '/images/helados/copa-berries.png',
        ],
        [
            'nombre' => 'ChocoBomba Frutal',
            'badge' => 'Más pedido',
            'concepto' => 'Yogurt en máquina',
            'descripcion_corta' => 'Helado de yogurt frutilla + fruta + salsa chocolate + galleta. Todo incluido.',
            'gradient' => 'from-amber-900/90 via-chocolate-900/80 to-rose-950/70',
            'imagen' => '/images/helados/chocobomba.png',
        ],
        [
            'nombre' => 'Tropical Crunch Mix',
            'badge' => 'Fresco',
            'concepto' => 'Yogurt en máquina',
            'descripcion_corta' => 'Helado de yogurt mango + fruta + galleta + toque dulce.',
            'gradient' => 'from-orange-600/90 via-amber-500/70 to-yellow-400/50',
            'imagen' => '/images/helados/tropical.png',
        ],
        [
            'nombre' => 'Berry Queen Yogurt',
            'badge' => 'Instagram',
            'concepto' => 'Yogurt en máquina',
            'descripcion_corta' => 'Helado de yogurt frutilla + salsa frutos + marshmallow.',
            'gradient' => 'from-fuchsia-700/90 via-rose-600/80 to-pink-500/60',
            'imagen' => '/images/helados/berry-queen.png',
        ],
        [
            'nombre' => 'Galleta Lovers Mix',
            'badge' => 'Postre',
            'concepto' => 'Yogurt en máquina',
            'descripcion_corta' => 'Helado de yogurt vainilla + plátano + galleta + manjar.',
            'gradient' => 'from-amber-800/90 via-orange-900/80 to-amber-950/70',
            'imagen' => '/images/helados/galleta-lovers.png',
        ],
    ],

    'combos_rotativos' => [
        [
            'nombre' => 'Fit Fresh Power',
            'badge' => 'Ligero',
            'concepto' => 'Yogurt en máquina',
            'descripcion_corta' => 'Helado de yogurt con fruta real + topping liviano + salsa.',
            'gradient' => 'from-emerald-700/90 via-teal-600/80 to-cyan-500/50',
            'imagen' => '/images/helados/fit-fresh.png',
        ],
        [
            'nombre' => 'Mega Antojo Supreme',
            'badge' => 'XL',
            'concepto' => 'Yogurt en máquina',
            'descripcion_corta' => 'Helado de yogurt XL: doble fruta, doble salsa y crocantes.',
            'gradient' => 'from-violet-900/90 via-purple-800/80 to-fuchsia-700/60',
            'imagen' => '/images/helados/mega-antojo.png',
        ],
    ],

    'yogen' => [
        'nombre' => 'Arma tu Yogurt Toppi\'s',
        'tagline' => 'Base yogurt + toppings — elige sabor y tamaño',
        'badge' => 'Helado de yogurt',
        'imagen' => '/images/helados/yogen-mix.png',
    ],

    'soft' => [
        'nombre' => 'Arma tu Soft Toppi\'s',
        'label' => 'Vainilla, chocolate, frutilla o aleado',
        'precios' => [2500, 3700],
    ],

    'artesanal' => [
        'nombre' => 'Arma tu Artesanal Toppi\'s',
        'label' => 'Sabores premium · elige sabor y extras',
        'precios' => [3300, 4500],
    ],

    'combo_semana' => [
        'cupon' => 'COMBOSEMANA',
        'descuento_clp' => 500,
        'monto_minimo' => 2800,
        'hora_inicio' => 15,
        'hora_fin' => 17,
        'dias_semana' => '1,2,3,4',
        'texto_horario' => 'Lunes a jueves · 15:00 a 17:00 hrs',
        'mensaje' => '$500 de descuento al pedir este combo (lun–jue 15:00–17:00)',
    ],
];
