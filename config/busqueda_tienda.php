<?php

/**
 * Búsqueda tienda — sinónimos y alcance por experiencia (regalos / comida / helados).
 */
return [
    'sinonimos' => [
        'mama' => ['mamá', 'madre', 'Pack Cumpleaños para Mamá'],
        'mamá' => ['mama', 'madre', 'Pack Cumpleaños para Mamá'],
        'papá' => ['papa', 'padre', 'día del padre'],
        'papa' => ['papá', 'padre'],
        'cumple' => ['cumpleaños', 'fiesta', 'Pack Cumpleaños'],
        'cumpleaños' => ['cumple', 'fiesta'],
        'desayuno' => ['once', 'Pack Desayuno', 'mermelada'],
        'amor' => ['pareja', 'romántico', 'Pack Amor'],
        'regalo' => ['pack', 'canasta', 'detalle'],
        'pack' => ['regalo', 'combo'],
        'chorri' => ['chorrillana'],
        'chorrillana' => ['chorri', 'papas'],
        'completo' => ['completos', 'hotdog'],
        'wok' => ['bowl', 'tallarin'],
        'helado' => ['soft', 'yogen', 'yogurt', 'artesanal', 'toppi'],
        'soft' => ['helado soft', 'cono'],
        'yogurt' => ['yogen', 'fruta'],
        'condolencias' => ['condolencia', 'té', 'sobrio'],
        'corporativo' => ['empresa', 'b2b', 'equipo'],
        'globo' => ['globos', 'metálico'],
        'cafe' => ['café', 'capuccino'],
        'café' => ['cafe', 'capuccino'],
    ],

    'alcances' => [
        'regalos' => [
            'categorias' => [
                'Regalos y Ocasiones',
                'Empaque y regalo',
            ],
            'nombre_contiene' => ['pack', 'regalo', 'canasta', 'desayuno', 'cumpleaños', 'amor', 'condolencias'],
        ],
        'salada' => [
            'categorias' => [
                'Bases saladas Toppi\'s',
                'Wok y Bowls Toppi\'s',
                'Chorrillanas Toppi\'s',
                'Completos y Churrascos Toppi\'s',
                'Sándwiches premium Toppi\'s',
                'Platos listos Toppi\'s',
                'Bebidas y Jugos',
            ],
        ],
        'helados' => [
            'categorias' => ['Helados Toppi\'s'],
            'sku_prefijos' => ['TOPPI-PARENT-', 'TOPPI-COMBO-', 'TOPPI-YOGEN-'],
        ],
        'packs' => [
            'nombre_contiene' => ['pack', 'combo', 'canasta', 'reserva', 'regalo'],
            'es_pack_only' => true,
        ],
    ],
];
