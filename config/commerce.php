<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Tienda por defecto (slug en commerce_stores)
    |--------------------------------------------------------------------------
    | Cuando el Host no coincide con primary_host ni host_aliases de otra tienda.
    */
    'default_store_slug' => env('COMMERCE_DEFAULT_STORE_SLUG', 'default'),

    /** API legacy POST /api/ventas (POS sin pago). Desactivado por defecto. */
    'legacy_pos_ventas_api' => (bool) env('COMMERCE_LEGACY_POS_VENTAS_API', false),

    /** Comanda /api/ordenes/{id}/ticket requiere ?expires=&sig= (usa APP_KEY). */
    'ticket_require_signature' => (bool) env('COMMERCE_TICKET_REQUIRE_SIGNATURE', true),

];
