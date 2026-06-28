<?php

/**
 * UX regalo Toppi's — quiz, comparador, upsell checkout, badges.
 * Dirección: Santiago Watt 205, Renaico.
 */
return [
    'retiro' => [
        'direccion' => 'Santiago Watt 205, Renaico',
        'horario' => 'Lun–Dom 9:00–21:00',
        'maps_url' => 'https://www.google.com/maps/search/?api=1&query=Santiago+Watt+205+Renaico+Chile',
        'armado_horas' => 24,
    ],

    /** Nombres exactos BD — badge «Recomendado» (actualizar con ventas reales) */
    'mas_pedidos' => [
        'Pack Cumpleaños para Mamá',
        'Pack Desayuno Clásico',
        'Pack Cumpleaños Dulce',
    ],

    'quiz' => [
        'titulo' => '¿Cuál es tu regalo Toppi\'s?',
        'subtitulo' => '3 preguntas · te llevamos al pack ideal',
        'preguntas' => [
            [
                'id' => 'para_quien',
                'texto' => '¿Para quién es?',
                'opciones' => [
                    ['id' => 'mama', 'label' => 'Mamá / figura materna', 'ocasion' => 'para_mama'],
                    ['id' => 'pareja', 'label' => 'Pareja / amor', 'ocasion' => 'amor'],
                    ['id' => 'cumple', 'label' => 'Cumpleaños', 'ocasion' => 'cumpleanos'],
                    ['id' => 'empresa', 'label' => 'Empresa / equipo', 'ocasion' => 'corporativo'],
                    ['id' => 'otro', 'label' => 'Otro / sin ocasión fija', 'ocasion' => 'impulso'],
                ],
            ],
            [
                'id' => 'tono',
                'texto' => '¿Qué tono buscas?',
                'opciones' => [
                    ['id' => 'festivo', 'label' => 'Festivo y dulce', 'ocasion' => 'cumpleanos'],
                    ['id' => 'calido', 'label' => 'Cálido y desayuno', 'ocasion' => 'desayuno'],
                    ['id' => 'sobrio', 'label' => 'Sobrio y respetuoso', 'ocasion' => 'condolencias'],
                    ['id' => 'premium', 'label' => 'Premium / romántico', 'ocasion' => 'amor'],
                ],
            ],
            [
                'id' => 'presupuesto',
                'texto' => '¿Presupuesto aproximado?',
                'opciones' => [
                    ['id' => 'bajo', 'label' => 'Hasta $15.000', 'pack' => 'Pack Desayuno Clásico'],
                    ['id' => 'medio', 'label' => '$15.000 – $20.000', 'pack' => 'Pack Cumpleaños para Mamá'],
                    ['id' => 'alto', 'label' => 'Más de $20.000', 'pack' => 'Pack Amor & Espumante'],
                ],
            ],
        ],
    ],

    'compare' => [
        'titulo' => 'Compara packs listos',
        'subtitulo' => 'Contenido fijo · reserva online · retiro Santiago Watt 205, Renaico',
        'packs' => [
            [
                'nombre' => 'Pack Desayuno Clásico',
                'ocasion' => 'desayuno',
                'modalidad' => 'Listo · cerrado',
                'destaca' => 'Mejor precio entrada',
            ],
            [
                'nombre' => 'Pack Cumpleaños para Mamá',
                'ocasion' => 'para_mama',
                'modalidad' => 'Listo · cerrado',
                'destaca' => 'Estrella ocasión',
            ],
            [
                'nombre' => 'Pack Cumpleaños Dulce',
                'ocasion' => 'cumpleanos',
                'modalidad' => 'Listo · cerrado',
                'destaca' => 'Festivo niños/jóvenes',
            ],
        ],
    ],

    'checkout_upsell' => [
        'titulo' => 'Completa tu regalo',
        'subtitulo' => 'Extras opcionales — suman al total',
        'items' => [
            [
                'nombre' => 'Globos metálicos',
                'mensaje' => 'Detalle festivo extra',
            ],
            [
                'nombre' => 'Ferrero Rocher 8 unidades',
                'mensaje' => 'Sube el ticket del regalo',
            ],
            [
                'nombre' => 'Jugo natural 1 litro',
                'mensaje' => 'Acompaña desayuno o cumpleaños',
            ],
        ],
    ],

    'comida_porciones' => [
        'titulo' => '¿Cuántos comen?',
        'subtitulo' => 'Comida Toppi\'s · elige tamaño de base',
        'filas' => [
            [
                'personas' => '1–2',
                'label' => 'Compartir clásica',
                'detalle' => '450 g papas · ideal pareja o detalle',
                'buscar' => 'Chorrillana clásica compartir',
            ],
            [
                'personas' => '3–4',
                'label' => 'Familiar',
                'detalle' => '900 g · para compartir en mesa',
                'buscar' => 'Chorrillana familiar clásica',
            ],
            [
                'personas' => '5+',
                'label' => 'Combo bandeja + postre',
                'detalle' => 'Chorrillana XL + 2 copas helado',
                'buscar' => 'Combo Familiar Chorrillana',
            ],
        ],
    ],

    'corporativo_form' => [
        'campos' => [
            ['key' => 'cantidad', 'label' => 'Cantidad de packs', 'placeholder' => 'ej. 15'],
            ['key' => 'empresa', 'label' => 'Empresa / colegio', 'placeholder' => 'Nombre'],
            ['key' => 'fecha', 'label' => 'Fecha necesaria', 'placeholder' => 'ej. 15 de junio'],
        ],
    ],

    /** Mensajes de confianza adicional (sin reseñas inventadas) */
    'prueba_social' => [
        'titulo' => 'Por qué regalar aquí',
        'items' => [
            'Productos reales del minimarket — no catálogo genérico',
            'Retiro Santiago Watt 205 o envío regalo en Renaico',
            'Packs armados con 24 h de anticipación mínima',
        ],
    ],
];
