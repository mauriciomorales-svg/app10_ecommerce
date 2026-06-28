<?php

/**
 * Productos fijados en "Lo más vendido" y stock objetivo para packs/showcase.
 * IDs canónicos tras deduplicar el catálogo DondeMorales.
 */
return [
  /**
   * Tras `php artisan catalog:seed-toppis` en inventario-api, los IDs de helado/chorrillana
   * se resuelven por nombre (todo el año, sin temporada).
   */
  'pinned_destacados_nombres' => [
    'Helado de yogurt',
    'ChocoBomba Frutal',
    'Soft Toppi\'s',
    'Artesanal Toppi\'s',
    'Mega Antojo Supreme',
    'Tropical Crunch Mix',
  ],

  'pinned_destacados' => [
    2046, // Yogurt con fruta
    2042, // ChocoBomba Frutal
    // Soft / Artesanal: IDs tras catalog:seed-toppis
    2048, // Mega Antojo Supreme
    2043, // Tropical Crunch Mix
    2044, // Berry Queen Yogurt
    1912, // Café (builder)
    1921, // Marraqueta (builder)
    1918, // Pack Desayuno Completo (personalizable)
    1919, // Canasta Familiar Semanal (personalizable)
    1924, // Pack Once Completa (builder)
  ],

  'default_stock' => [
    1912 => 50,
    1921 => 50,
    1918 => 15,
    1919 => 10,
    1924 => 12,
  ],

  /** Duplicados a desactivar (mismo nombre, peor registro). */
  'deactivate_product_ids' => [
    1909, 1910, 1911, 1917, 1930, // Pack Desayuno duplicados
    1931, // Canasta duplicada
    1932, // Pack Once duplicado
    1693, // balerina duplicada
  ],

  'boost_veces_vendido' => [
    1912 => 500,
    1921 => 480,
    1918 => 120,
    1919 => 100,
    1924 => 90,
  ],
];
