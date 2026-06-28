<?php

/**
 * Bloques de experiencia en la home: Helado Toppi's → Regalo Toppi's → Comida Toppi's.
 */
return [
    'toppis' => [
        'title' => 'Helado Toppi\'s',
        'tagline' => 'Elige tu base, ponle tu Toppi\'s',
        'description' => 'Combo yogurt desde $2.990 · helado soft $1.000 · yogurt $2.800 · artesanal $2.000',
        'categoria_nombre' => 'Helados Toppi\'s',
        'categorias_ver_todas' => [
            'Helados Toppi\'s',
        ],
        'productos_destacados' => [
            'Copa Crunchy Biscoff Toppi\'s',
            'Copa Antioxidante Tropical Toppi\'s',
            'Copa Cheesecake Berries Toppi\'s',
            'ChocoBomba Frutal',
            'Helado de yogurt',
        ],
    ],

    'regalos' => [
        'title' => 'Regalo Toppi\'s',
        'tagline' => 'Tu ocasión, tu mensaje — lo armamos con productos reales',
        'description' => 'Pack listo o personalizable: desayuno, once, cumpleaños. Retiro Santiago Watt 205, Renaico · envío gratis packs regalo en Renaico.',
        'categoria_nombre' => 'Regalos y Ocasiones',
        'categorias_ver_todas' => [
            'Regalos y Ocasiones',
            'Empaque y regalo',
        ],
        'productos_destacados' => [
            'Pack Desayuno Sorpresa',
            'Regalo de Pareja — Tarde Dulce',
            'Pack Once Completa',
        ],
    ],

    'salada' => [
        'title' => 'Comida Toppi\'s',
        'tagline' => 'Elige tu base, ponle tu Toppi\'s',
        'description' => 'Chorrillana, completo, wok o plato listo. Precio claro en cada paso · retiro Santiago Watt 205, Renaico.',
        'categoria_nombre' => 'Bases saladas Toppi\'s',
        'categorias_ver_todas' => [
            'Platos listos Toppi\'s',
            'Bases saladas Toppi\'s',
            'Wok y Bowls Toppi\'s',
            'Chorrillanas Toppi\'s',
            'Completos y Churrascos Toppi\'s',
            'Bebidas y Jugos',
        ],
        'productos_destacados' => [
            'Wok y Bowl Toppi\'s',
            'Base salada Toppi\'s',
            'Bowl swicy pollo',
            'Chorrillana Toppi\'s',
        ],
    ],

    /** Platos sin personalización obligatoria (cuando existan en catálogo) */
    'platos_listos' => [
        'title' => 'Platos listos',
        'tagline' => 'Listos para comer — compartir o llevar',
        'description' => 'Compartir, XL, familiar y Mega. Carnes: clásica, 1 carne, dúo, trilogía. También salchipapas y completos.',
        'categoria_nombre' => 'Chorrillanas Toppi\'s',
        'categorias_ver_todas' => [
            'Chorrillanas Toppi\'s',
            'Platos listos Toppi\'s',
            'Bebidas y Jugos',
        ],
        'productos_destacados' => [
            'Chorrillana Mega familia clásica',
            'Chorrillana familiar clásica',
            'Chorrillana clásica compartir',
            'Chorrillana dúo compartir',
            'Salchipapas clásica',
            'Salchipapas con queso',
            'Completo italiano',
            'Completo chacarero',
            'Churrasco clásico',
        ],
    ],

    'empaques' => [
        'titulo' => 'Empaque para tu pedido',
        'items' => [
            ['icon' => 'bag', 'text' => 'Bolsa estándar o reforzada'],
            ['icon' => 'gift', 'text' => 'Caja regalo en checkout (presentación premium)'],
        ],
    ],
];
