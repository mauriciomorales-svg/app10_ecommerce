/** Datos compartidos JobsHours · tienda B2B */
import { formatCLP } from '../lib/money';

/** JobsHours · atención manual (sin bot) */
export const WHATSAPP = '56965133289';
export const WHATSAPP_DISPLAY = '+56 9 6513 3289';

export const L = {
  tabletPedidos: 'Tablet de pedidos',
  maquinita: 'maquinita Mercado Pago',
  mp: 'Mercado Pago',
  pagoMes: 'pago de cada mes',
  instalacion: 'instalación',
  inventario: 'inventario',
  programa: 'programa',
  packAndando: 'Te lo dejamos andando',
} as const;

/** @see jobshours/PRECIOS-OFICIAL-2026.md */
export const PRECIOS = {
  planMinimo: 29990,
  planIA: 44990,
  planOmni: 59990,
  planRetail: 19990,
  comboAndando: 109990,
  implAndando: 80000,
  implCompleta: 100000,
  implActivacion: 30000,
  /** Pack Express: tablet 10" + soporte + instalación + mes 1 (oferta llave en mano entrada) */
  packExpress: 199990,
  llaveEnMano: 270000,
  roiPedidos: 6,
  roiTicket: 5000,
} as const;

export const MARCA = {
  madre: 'Tiendas Inteligentes JobsHours',
  headline: 'Tu cliente pide y paga solo.',
  subhead: 'Tú te quedas en la cocina.',
  explainer:
    'El cliente elige en la tablet o paga con el celular, paga con tarjeta o Mercado Pago, y el pedido va directo a cocina.',
} as const;

export const FLYERS = {
  kiosko: '/jobshours/flyers/kiosko-mostrador.png',
  retail: '/jobshours/flyers/caja-minimarket.png',
  pagos: '/jobshours/flyers/pagos-mercadopago.png',
  instalacion: '/jobshours/flyers/instalacion-servicios.png',
} as const;

/** Fotos de ambiente (premium en home) — Unsplash, uso decorativo */
export const HOME_AMBIENT = {
  comida:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  minimarket:
    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=80',
  hero: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=80',
} as const;

/** Galería home: flyers 16:9 (sin repetir en bloque inferior) */
export const HOME_GALLERY = [
  { src: FLYERS.kiosko, alt: 'Tablet de pedidos en mostrador', caption: 'Cliente pide y paga solo' },
  { src: FLYERS.pagos, alt: 'Cobro con Mercado Pago', caption: 'Tarjeta, QR y maquinita enlazada' },
  { src: FLYERS.instalacion, alt: 'Instalación en tu local', caption: 'Te lo dejamos andando en 7 días' },
] as const;

/** Bloque «Te lo dejamos andando» en home: foto de ambiente (no repetir flyers de HOME_GALLERY) */
export const HOME_ANDANDO_VISUAL = HOME_AMBIENT.comida;

export const WA_LINK = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  'Hola, quiero una demo de JobsHours (tablet de pedidos + Mercado Pago).',
)}`;

export const WA_PACK_EXPRESS = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  `Hola, quiero el Pack JobsHours Express (${formatCLP(PRECIOS.packExpress)}): tablet de pedidos + instalación + mes 1. ¿Cuánto sale la maquinita Point si no tengo?`,
)}`;

export const WA_PACK_ANDANDO = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  `Hola, quiero «${L.packAndando}» (${formatCLP(PRECIOS.comboAndando)}): instalación + primer mes del programa.`,
)}`;

export const WA_RETAIL_LINK = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  'Hola, quiero info de caja minimarket JobsHours.',
)}`;

export const WA_OMNI_LINK = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  'Hola, tengo local mixto (comida + góndola) y quiero info JobsHours.',
)}`;

export const SOCIAL_PROOF = {
  headline: 'Locales piloto en Araucanía',
  subline: 'Rotiserías, fuentes y cafés probando tablet de pedidos + Mercado Pago',
  locales: ['Rotisería · sector urbano', 'Fuente de soda', 'Café de barrio'],
} as const;

export const TESTIMONIAL = {
  badge: 'Cliente piloto · Araucanía',
  title: 'En hora punta, sin fila en caja',
  body:
    'El cliente elige en la tablet, paga con Mercado Pago y la comanda llega a cocina. El dueño no depende del celular para cobrar en fila.',
  quote: '«Menos filas, menos pedidos perdidos por WhatsApp y más tiempo en el negocio.»',
  attribution: 'Dueño de rotisería · Araucanía (nombre compartido bajo solicitud en demo)',
} as const;

/** Tablets listas para despacho Pack Express (operación: actualizar al comprar stock) */
export const PACK_EXPRESS_STOCK_DISPONIBLE = 0;

export const PACK_SKUS = {
  express: 'JH-PKG-EXPRESS',
  andando: 'JH-PKG-FERIA',
  planMes: 'JH-01',
} as const;

/** Dos problemas distintos: pedir en tablet vs cobrar con tarjeta */
export const DOS_PILARES = [
  {
    id: 'pedidos',
    titulo: 'Tablet de pedidos',
    subtitulo: 'Fila, menú y comanda a cocina',
    detalle: 'Lo que el cliente toca para armar el pedido. En Pack Express va incluida.',
    enPackExpress: true,
  },
  {
    id: 'cobro',
    titulo: 'Maquinita Mercado Pago (Point)',
    subtitulo: 'Débito y crédito en mostrador',
    detalle:
      'Donde pasan la tarjeta. Sin ella puedes cobrar con QR en celular; en hora punta la maquinita reduce fila y ventas perdidas.',
    enPackExpress: false,
  },
] as const;

/** Transparencia Point: valor para el cliente y cómo puede obtenerla JobsHours */
export const POINT_CLIENTE = {
  titulo: 'La maquinita también tiene valor (y va aparte del Pack Express)',
  resumen:
    'JobsHours cobra el programa y la instalación. La maquinita es equipo de cobro: puede ser tuya desde Mercado Pago o te la facilitamos nosotros, siempre con precio claro aparte.',
  opciones: [
    'Ya tienes Point: la enlazamos en la instalación (sin costo de hardware a JobsHours).',
    'La compras directo en Mercado Pago: te indicamos modelo (Smart o Mini) y link.',
    'JobsHours puede entregártela o revenderla: te cotizamos por WhatsApp antes de pagar; va en cobro aparte del pack.',
  ],
  regla:
    'Nunca está “escondida” dentro del precio del pack: si te la entregamos nosotros, lo acordamos por escrito o WhatsApp con monto aparte.',
  sinPoint:
    'Si aún no tienes maquinita: el primer día puedes cobrar con QR en celular; cuando tengas Point, la conectamos en visita.',
} as const;

export const PACK_EXPRESS_INCLUYE = [
  'Tablet 10" para pedidos en mostrador',
  'Soporte de mesón (según stock)',
  'Instalación: Mercado Pago, menú y enseñanza ~30 min',
  'Enlace de cobro: tu Point, QR celular, o maquinita que compres aparte',
  'Primer mes del programa incluido',
] as const;

export const PACK_EXPRESS_APARTE = [
  'Maquinita Point (cobro con tarjeta en caja) — no incluida en los $199.990',
  'Puedes comprarla en Mercado Pago o pedirla a JobsHours con precio aparte acordado',
] as const;
