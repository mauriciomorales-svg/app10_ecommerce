<?php

/**
 * Plantillas para copiar personalización (armador web) desde productos referencia.
 * Los IDs/nombres se resuelven en ProductBuilderTemplateService.
 */
return [
    'templates' => [
        'helado_toppis' => [
            'label' => 'Helado Toppi\'s (armar)',
            'description' => 'Grupos de cono, sabor, salsa y extras desde un helado base existente.',
            'source_name' => 'Helado Soft Toppi\'s',
            'builder_profile' => 'helado_arma',
        ],
        'chorrillana' => [
            'label' => 'Chorrillana / salada',
            'description' => 'Opciones de proteína, salsa y extras.',
            'source_name' => 'Chorrillana Toppi\'s',
            'builder_profile' => 'salada_chorrillana',
        ],
        'regalo_pack' => [
            'label' => 'Pack regalo',
            'description' => 'Pack con opciones + campos de dedicatoria.',
            'source_name' => 'Pack Desayuno Completo',
            'es_pack' => true,
            'builder_profile' => 'regalo',
        ],
    ],
];
