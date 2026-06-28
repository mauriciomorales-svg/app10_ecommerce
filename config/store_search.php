<?php

return [
    /** Registrar búsquedas del catálogo web (dondemorales.cl). */
    'analytics_enabled' => env('STORE_SEARCH_ANALYTICS', true),

    /** Longitud mínima del término para guardar. */
    'min_query_length' => 2,

    /** Evita duplicar el mismo término+alcance+sesión en N segundos. */
    'dedupe_seconds' => 90,
];
