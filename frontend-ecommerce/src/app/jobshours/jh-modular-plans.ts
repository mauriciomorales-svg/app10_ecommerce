/** Planes modulares Donde Morales Tech · ecosistema JobsHours B2B */
import { formatCLP } from '../lib/money';
import { WHATSAPP } from './jh-data';

export type ModuleId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5';

export type ModularPackId = 'whatsapp' | 'operacion' | 'tienda' | 'comercio360';

export const MODULAR_TAGLINE = 'Modular — crece a tu ritmo';

export const MODULAR_SUBLINE =
  'Todos los packs incluyen el núcleo: catálogo en BD + app de inventario con Carga IA y escáner. Sumas bot, caja o tienda web según presupuesto — sin pagar lo que aún no usas.';

/** Módulos técnicos (ya en producción; se escala por plan + soporte + implementación). */
export const MODULES: Record<
  ModuleId,
  { short: string; title: string; line: string; requires?: ModuleId[] }
> = {
  M1: {
    short: 'M1',
    title: 'Catálogo + BD',
    line: 'Productos, fotos, categorías y base única para todo el ecosistema.',
  },
  M2: {
    short: 'M2',
    title: 'Bot WhatsApp IA',
    line: 'Catálogo 24/7, respuestas con IA y derivación a humano.',
    requires: ['M1'],
  },
  M3: {
    short: 'M3',
    title: 'App inventario',
    line: 'Escáner, Carga IA y stock al día desde el celular.',
    requires: ['M1'],
  },
  M4: {
    short: 'M4',
    title: 'POS + venta colaborativa',
    line: 'Caja, roles de equipo y cobro con Mercado Pago en mostrador.',
    requires: ['M1'],
  },
  M5: {
    short: 'M5',
    title: 'Tienda online',
    line: 'Web con checkout, stock sincronizado y dominio propio.',
    requires: ['M1'],
  },
};

export const NUCLEO_MODULES: ModuleId[] = ['M1', 'M3'];

export const NUCLEO = {
  title: 'Núcleo Catálogo + Inventario',
  line: 'M1 + M3 en todos los packs. Sin esto no hay bot, caja ni web confiables.',
  modules: NUCLEO_MODULES,
} as const;

export type PriceRange = { setupMin: number; setupMax: number; ufMin: number; ufMax: number };

export type ModularPack = {
  id: ModularPackId;
  badge: string;
  title: string;
  tagline: string;
  forWho: string;
  modules: ModuleId[];
  trial: string;
  price: PriceRange;
  highlight?: boolean;
  limits: { sku: string; users: string; support: string };
};

export const MODULAR_PACKS: ModularPack[] = [
  {
    id: 'whatsapp',
    badge: 'Entrada recomendada',
    title: 'WhatsApp Inteligente',
    tagline: 'Catálogo vivo + bot + inventario',
    forWho: 'Vendes por WhatsApp y quieres dejar de responder lo mismo a mano.',
    modules: ['M1', 'M2', 'M3'],
    trial: 'Trial guiado 7–10 días',
    price: { setupMin: 490_000, setupMax: 590_000, ufMin: 1.3, ufMax: 1.6 },
    limits: { sku: 'hasta 100 SKU', users: '1–2 usuarios', support: 'Lun–Sáb hábil' },
  },
  {
    id: 'operacion',
    badge: 'Local con equipo',
    title: 'Operación Local',
    tagline: 'Núcleo + caja y venta en piso',
    forWho: 'Minimarket, feria o restaurante con mostrador y más de una persona atendiendo.',
    modules: ['M1', 'M3', 'M4'],
    trial: 'Trial guiado 14 días',
    price: { setupMin: 690_000, setupMax: 850_000, ufMin: 2.0, ufMax: 2.5 },
    limits: { sku: 'hasta 500 SKU', users: '3–5 usuarios', support: 'Hábil + 30 días onboarding' },
  },
  {
    id: 'tienda',
    badge: 'Venta 24/7',
    title: 'Tienda Online',
    tagline: 'Núcleo + ecommerce con tu marca',
    forWho: 'Quieres vender por internet con el mismo inventario del local.',
    modules: ['M1', 'M3', 'M5'],
    trial: 'Trial guiado 14 días',
    price: { setupMin: 750_000, setupMax: 950_000, ufMin: 2.2, ufMax: 2.8 },
    limits: { sku: 'hasta 500 SKU', users: '2–4 usuarios', support: 'Web + catálogo' },
  },
  {
    id: 'comercio360',
    badge: 'Todo integrado',
    title: 'Comercio 360',
    tagline: 'Bot + caja + tienda web · una sola BD',
    forWho: 'Local + WhatsApp + web con soporte extendido y marcha blanca.',
    modules: ['M1', 'M2', 'M3', 'M4', 'M5'],
    trial: '21 días + marcha blanca 30 días',
    price: { setupMin: 990_000, setupMax: 1_200_000, ufMin: 2.8, ufMax: 3.5 },
    highlight: true,
    limits: { sku: 'hasta 5.000 SKU', users: '10+ usuarios', support: 'Prioritario 60 días' },
  },
];

export type ModularAddon = {
  module: ModuleId;
  title: string;
  line: string;
  setupHint: string;
  ufHint: string;
  fitsWith: string;
};

/** Add-ons para quien ya tiene un pack y quiere sumar un módulo. */
export const MODULAR_ADDONS: ModularAddon[] = [
  {
    module: 'M2',
    title: 'Bot WhatsApp IA',
    line: 'Activa respuestas automáticas y catálogo en WhatsApp Business.',
    setupHint: 'desde ' + formatCLP(180_000),
    ufHint: '+0,4 – 0,6 UF/mes',
    fitsWith: 'Operación Local · Tienda Online',
  },
  {
    module: 'M4',
    title: 'POS + venta colaborativa',
    line: 'Caja, roles y cobro con Point en mostrador.',
    setupHint: 'desde ' + formatCLP(220_000),
    ufHint: '+0,5 – 0,8 UF/mes',
    fitsWith: 'WhatsApp Inteligente · Tienda Online',
  },
  {
    module: 'M5',
    title: 'Tienda online',
    line: 'Dominio, checkout y stock sincronizado con tu catálogo.',
    setupHint: 'desde ' + formatCLP(280_000),
    ufHint: '+0,6 – 1,0 UF/mes',
    fitsWith: 'WhatsApp Inteligente · Operación Local',
  },
];

export const COMPARE_ROWS: { label: string; keys: Record<ModularPackId, boolean | string> }[] = [
  {
    label: 'Catálogo + BD (M1)',
    keys: { whatsapp: true, operacion: true, tienda: true, comercio360: true },
  },
  {
    label: 'App inventario + Carga IA (M3)',
    keys: { whatsapp: true, operacion: true, tienda: true, comercio360: true },
  },
  {
    label: 'Bot WhatsApp IA (M2)',
    keys: { whatsapp: true, operacion: false, tienda: false, comercio360: true },
  },
  {
    label: 'POS + venta colaborativa (M4)',
    keys: { whatsapp: false, operacion: true, tienda: false, comercio360: true },
  },
  {
    label: 'Tienda online + checkout (M5)',
    keys: { whatsapp: false, operacion: false, tienda: true, comercio360: true },
  },
  {
    label: 'Dominio propio en producción',
    keys: {
      whatsapp: 'Piloto',
      operacion: 'Subdominio',
      tienda: true,
      comercio360: true,
    },
  },
  {
    label: 'Horas onboarding incluidas',
    keys: { whatsapp: '4–6 h', operacion: '8–12 h', tienda: '8–12 h', comercio360: '16–24 h' },
  },
];

export function formatSetupRange(p: PriceRange): string {
  if (p.setupMin === p.setupMax) return formatCLP(p.setupMin);
  return `${formatCLP(p.setupMin)} – ${formatCLP(p.setupMax)}`;
}

export function formatUfRange(p: PriceRange): string {
  const fmt = (n: number) => n.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (p.ufMin === p.ufMax) return `${fmt(p.ufMin)} UF/mes + IVA`;
  return `${fmt(p.ufMin)} – ${fmt(p.ufMax)} UF/mes + IVA`;
}

export function waModularPackLink(pack: ModularPack): string {
  const mods = pack.modules.map((m) => MODULES[m].title).join(' + ');
  const text = [
    `Hola, quiero cotizar el pack «${pack.title}» (${MODULAR_TAGLINE}).`,
    `Módulos: ${mods}.`,
    `Setup referencial: ${formatSetupRange(pack.price)} · ${formatUfRange(pack.price)}.`,
    '¿Podemos agendar demo?',
  ].join(' ');
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export const WA_MODULAR_GENERAL = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  'Hola, quiero entender los planes modulares JobsHours (catálogo + inventario + bot/POS/web). ¿Cuál pack me conviene?',
)}`;

export const MIGRATION_STEPS = [
  'WhatsApp Inteligente',
  '+ POS → Operación Local',
  '+ Web → Comercio 360',
] as const;
