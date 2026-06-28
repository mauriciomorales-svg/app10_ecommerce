<?php

/**
 * Marketing Toppi's — cupones, WhatsApp y pixel (env en frontend con NEXT_PUBLIC_*).
 */
return [
  'whatsapp_url' => env('TOPPIS_WHATSAPP_URL', 'https://wa.me/56900000000'),
  'whatsapp_message' => env(
      'TOPPIS_WHATSAPP_MESSAGE',
      'Hola DondeMorales, quiero pedir Toppi\'s para retiro en Renaico 🍟'
  ),
  /** Sin cupón automático en home — activar solo campañas puntuales en Filament */
  'coupon_direct_web' => env('TOPPIS_COUPON_DIRECT', ''),
  'coupon_launch' => env('TOPPIS_COUPON_LAUNCH', ''),
  'meta_pixel_id' => env('META_PIXEL_ID'),
];
