<?php

/**
 * Modelo de negocio helados Toppi's — DondeMorales (Watt 205).
 *
 * La gracia del modelo: base con identidad + agregados que suben percepción de valor
 * y margen (a menudo mejor que el helado base).
 *
 * Dos caminos complementarios (mismo objetivo: subir ticket promedio):
 * 1. PREDISEÑADO — Combos / Yogen con receta y nombre (decisión rápida, margen en extras opcionales).
 * 2. DISEÑADO — Soft / Artesanal / Yogen personalizado (cliente elige, upsell en toppings).
 *
 * Sinergia minimarket: Chubis, Tiffany, galletas, etc. del retail pueden ser Toppi's extras
 * en el helado — especialmente unidades cerca de vencimiento (doble win: cero merma + margen alto).
 */
return [
    'prioridad' => 'yogen',
    'mensaje_yogen' => 'Activar la máquina Yogen todos los días — es el diferenciador.',

    /** Regla de oro ticket */
    'ticket' => [
        'objetivo_clp' => 3200,
        'estrategia' => 'Base accesible + agregados visibles. Nunca vender solo el piso.',
    ],

    /** Camino 1: receta cerrada, nombre propio, todo incluido (upsell = bebida o golosina extra) */
    'prediseñado' => [
        'productos' => ['combos_yogen', 'yogen_mix_receta'],
        'rol' => 'decision_rapida_vitrina',
        'upsell' => ['bebida', 'golosina_minimarket_opcional'],
        'no_rehacer_en_builder' => true,
    ],

    /** Camino 2: cliente arma; respetar identidad de base (soft 3 opciones máquina, artesanal bolas, yogen fruta) */
    'diseñado' => [
        'productos' => ['soft', 'artesanal', 'yogen_mix_custom'],
        'rol' => 'personalizacion_y_margen',
        'embudo' => ['base', 'sabor_o_fruta', 'formato', 'toppings_opcionales'],
        'upsell' => ['salsas', 'crocantes', 'golosina_minimarket', 'bebida'],
    ],

    'lineas' => [
        'soft' => [
            'nombre_producto' => 'Soft Toppi\'s',
            'sku' => 'TOPPI-PARENT-SOFT',
            'rol' => 'entrada_volumen',
            'precio_cono_chico' => 1000,
            'precio_cono_grande' => 1800,
            'maquina' => [
                'tolvas' => 2,
                'opciones_cliente' => 3,
                'descripcion' => 'Vainilla, chocolate o sabor mixto — misma porción siempre',
            ],
            'copy' => 'Máquina soft: 3 opciones · cono $1.000 o $1.800',
        ],
        'yogen' => [
            'nombre_producto' => 'Helado de yogurt',
            'sku' => 'TOPPI-YOGEN-MIX-MED',
            'rol' => 'estrella_maquina',
            'precio' => 2800,
            'copy' => 'Yogurt + fruta en máquina · incluye 1 salsa · extras opcionales',
        ],
        'artesanal' => [
            'nombre_producto' => 'Artesanal Toppi\'s',
            'sku' => 'TOPPI-PARENT-ARTESANAL',
            'rol' => 'premium_tradicional',
            'precio_1_bola' => 2000,
            'precio_2_bolas' => 3500,
            'copy' => '1 o 2 bolas · toppings y golosinas del minimarket opcionales',
        ],
    ],

    'combos_yogen_rango' => [2990, 3790],

    /** Precios Toppi's clásicos (salsa, fruta) */
    'extras' => [
        'salsa' => 300,
        'fruta_crocante' => 400,
        'premium' => 700,
    ],

    /**
     * Puente helado ↔ minimarket: golosinas retail como topping visual.
     * En mostrador: priorizar stock con vencimiento próximo (FEFO).
     */
    'minimarket_toppings' => [
        'activo' => true,
        'categorias_buscar' => ['Snacks y Golosinas', 'Chocolates'],
        'patrones_nombre' => [
            'chubi', 'chubby', 'tiffany', 'galleta', 'oreo', 'sublime', 'rocklets',
            'alfajor', 'nutella', 'mckay', 'club social', 'gansito', 'kripy',
        ],
        'mensaje_sugerencia' => 'Corónalo — golosina del minimarket como Toppi\'s extra',
        'mensaje_vencimiento_proximo' => 'Hoy en oferta topping — aprovecha antes que se vaya',
        'dias_vencimiento_priorizar' => 14,
        'margen_nota' => 'Costo retail bajo o cero (merma evitada); precio topping $400–700+',
    ],

    'kpis' => [
        'ticket_promedio_objetivo' => 3200,
        'pct_pedidos_con_extra_pagado' => 35,
        'mix_prediseñado_pct' => 45,
        'mix_diseñado_pct' => 55,
        'ventas_yogen_por_dia_objetivo' => 5,
    ],

    /** Promo horaria: ver helados_combos.php → combo_semana (fuente única API) */

    /** Cartel mostrador + web — golosinas FEFO del minimarket */
    'toppis_del_dia' => [
        'titulo' => 'Toppi\'s del día',
        'subtitulo' => 'Del minimarket — córtala y coroná el helado (+$400–700)',
        'max_items' => 3,
        'script_cajero' => '¿Le agregamos {nombre} triturado encima? Conviene hoy — vence {fecha}.',
    ],
];
