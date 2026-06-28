'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  BarChart3,
  ChevronDown,
  ClipboardCheck,
  Headphones,
  MessageCircle,
  MonitorSmartphone,
  Package,
  PlayCircle,
  Plug,
  ScanLine,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  Users,
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import CartButton from '../components/CartButton';
import ProductBuilderModal from '../components/ProductBuilderModal';
import type { ProductCardItem } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useCommerceStore } from '../context/CommerceStoreContext';
import { apiFetch } from '../lib/api';
import { formatCLP } from '../lib/money';
import { JhPedidosVsCobro } from './JhPedidosVsCobro';
import { JhPlansChecklistSection } from './JhPlansChecklistSection';
import { CatalogRubro, JhCatalogRubroTabs, rubroFromHash } from './JhCatalogRubroTabs';
import { JhModularPlansSection } from './JhModularPlansSection';
import { JhSistemaDiagram } from './JhSistemaDiagram';
import { JhTestimonialBlock } from './JhSocialProof';

type Producto = ProductCardItem & { descripcion?: string; codigobarra?: string };

import { WA_LINK, WA_OMNI_LINK, WA_RETAIL_LINK, WHATSAPP_DISPLAY } from './jh-data';

/** Textos visibles al comprador — sin jerga interna */
const L = {
  packAndando: 'Te lo dejamos andando',
  packAndandoCorto: 'instalación + primer mes',
  tabletPedidos: 'Tablet de pedidos',
  maquinita: 'maquinita Mercado Pago',
  mp: 'Mercado Pago',
  pagoMes: 'pago de cada mes',
  instalacion: 'instalación',
  inventario: 'inventario',
  programa: 'programa',
} as const;

/** @see jobshours/PRECIOS-OFICIAL-2026.md */
const PRECIOS = {
  planMinimo: 29990,
  planIA: 44990,
  planOmni: 59990,
  planRetail: 19990,
  comboFeria: 109990,
  implFeria: 80000,
  implCompleta: 100000,
  implActivacion: 30000,
  addonSoporte: 9990,
  srvMant: 19990,
  llaveEnMano: 270000,
  roiPedidos: 6,
  roiTicket: 5000,
} as const;

const MARCA = {
  madre: 'Tiendas Inteligentes JobsHours',
  promesa: 'Tu cliente pide y paga solo. Tú te quedas en la cocina.',
  /** Mismo relato que el flyer kiosko-mostrador */
  explainer:
    'El cliente elige en la tablet o paga con el celular, paga con tarjeta o Mercado Pago, y el pedido va directo a cocina.',
} as const;

/** Barra blanca del flyer: 3 beneficios concretos */
const FLYER_BENEFITS = [
  { title: 'Sin efectivo', sub: 'Menos caja en mostrador', icon: Banknote },
  { title: 'Sin errores', sub: 'Pedido claro', icon: ClipboardCheck },
  { title: 'Más higiene', sub: 'Tú en la cocina', icon: Sparkles },
] as const;

/** Post caja-minimarket · JH-04 */
const RETAIL_MARCA = {
  badge: 'Caja minimarket · Lector e inventario',
  headline: ['Barra, lector e inventario', 'bajo control.'],
  explainer:
    'Para almacén, ferretería o minimarket. Escaneas el código, el inventario se actualiza solo y te avisa cuando algo se acaba.',
} as const;

const RETAIL_BENEFITS: { title: string; sub: string; icon: LucideIcon }[] = [
  { title: 'Lector USB', sub: 'Conectas y listo', icon: Plug },
  { title: 'Reportes al instante', sub: 'Ventas e inventario', icon: BarChart3 },
  { title: 'Varios usuarios', sub: 'Roles por caja', icon: Users },
];

const RETAIL_STEPS = [
  { title: 'Escaneas', sub: 'Código de barras' },
  { title: 'Inventario al día', sub: 'Se actualiza solo' },
  { title: 'Decides mejor', sub: 'Reportes claros' },
] as const;

const PLAN_SKUS = ['JH-01', 'JH-02', 'JH-03'] as const;

/** SKU = interno. Textos = lo que lees en 2 segundos (alineado al catálogo B2B). */
const PLAN_PUBLIC = {
  'JH-01': {
    title: 'Menos filas',
    line: 'El cliente pide y paga solo',
  },
  'JH-02': {
    title: 'Menos WhatsApp',
    line: 'Incluye lo anterior + WhatsApp contesta solo',
  },
  'JH-03': {
    title: 'También en web',
    line: 'Incluye lo anterior + vendes por internet',
  },
  'JH-04': {
    title: 'Barra y inventario',
    line: 'Lector de barras · inventario al día',
  },
} as const;

const FLYERS = {
  kiosko: '/jobshours/flyers/kiosko-mostrador.png',
  kioskoBot: '/jobshours/flyers/kiosko-bot-whatsapp.png',
  omnicanal: '/jobshours/flyers/local-omnicanal.png',
  retail: '/jobshours/flyers/caja-minimarket.png',
  restaurante: '/jobshours/flyers/restaurante-pro.png',
  instalacion: '/jobshours/flyers/instalacion-servicios.png',
  pagos: '/jobshours/flyers/pagos-mercadopago.png',
  ecosistema: '/jobshours/flyers/ecosistema.png',
  ecosistemaIntegrado: '/jobshours/flyers/ecosistema-integrado.png',
} as const;

/** Cuatro formas de vender (local mixto) */
const OMNI_PILLARS = [
  { n: '1', title: 'Vendedor con celular', sub: 'En el piso · la caja cobra', icon: Users },
  { n: '2', title: 'Inventario en bodega', sub: 'Celular en bodega · inventario al día', icon: Smartphone },
  { n: '3', title: 'Tablet de pedidos', sub: 'Cliente pide y paga solo', icon: UtensilsCrossed },
  { n: '4', title: 'Tienda por internet', sub: 'Mismo inventario online', icon: MonitorSmartphone },
] as const;

const JH_ENCARGA = [
  `${L.programa} en tablet de pedidos o caja`,
  `Alta y configuración ${L.mp}`,
  'Menú en la tablet y enseñanza de uso',
  'Soporte Lun–Sáb por WhatsApp',
] as const;

const INCLUYE_JH = [
  `${L.programa} activo (tablet de pedidos o caja)`,
  'Menú cargado y ajustes menores del mes',
  `Ayuda por WhatsApp Lun–Sáb 09:00–21:00`,
  'Coordinación de instalación si la contratas',
] as const;

const COMPRA_TU = [
  `Tablet de pedidos (en Pack Express va incluida; en otros packs la compras tú)`,
  `${L.maquinita} (Point): cobro con tarjeta — compra en Mercado Pago, o JobsHours te la entrega con precio aparte acordado`,
  'Internet Wi‑Fi estable en el local',
  'Empresa lista (RUT) si el negocio ya está formalizado',
  'Boleta legal al SII si la necesitas con contador (aparte)',
] as const;

/** Transparencia: dos bolsillos de dinero (evita sensación de estafa). */
const PAGO_MENSUAL_INCLUYE = [
  `Uso del ${L.programa} cada mes (tablet de pedidos o caja)`,
  'Soporte Lun–Sáb 09:00–21:00 por WhatsApp',
  'Cambios chicos del menú durante el mes',
] as const;

const PAGO_IMPL_INCLUYE: { title: string; detail: string }[] = [
  {
    title: `Cuenta ${L.mp} Negocios`,
    detail:
      'Revisamos datos del negocio, creamos o ajustamos la cuenta y dejamos listo cobrar con tarjeta o código en el celular.',
  },
  {
    title: 'Menú en la tablet',
    detail: 'Cargamos tus productos (hasta ~20 en la oferta base) y probamos que se vea bien en pantalla.',
  },
  {
    title: L.maquinita,
    detail: `Conectamos la ${L.maquinita} o el pago con celular y hacemos una venta de prueba contigo.`,
  },
  {
    title: 'Enseñanza ~30 min',
    detail: 'En tu local o por videollamada: cómo ver pedidos y trabajar el día a día.',
  },
];

const PAGO_APARTE_OPCIONAL: { title: string; detail: string }[] = [
  {
    title: L.maquinita,
    detail:
      'Para cobrar débito/crédito en mostrador. No va en el precio del Pack Express. Puedes comprarla en Mercado Pago, traer la tuya, o pedir a JobsHours entrega/reventa con monto aparte acordado antes de pagar.',
  },
  {
    title: 'Tablet de pedidos',
    detail: 'En Pack Express va incluida. En otros packs la compras tú (te guiamos qué modelo).',
  },
  {
    title: 'Abrir o regularizar empresa',
    detail: `Si aún no tienes negocio listo (RUT, inicio de actividades): se cotiza aparte. No va en «${L.packAndando}».`,
  },
  {
    title: 'Boleta legal de venta',
    detail: `Registro con contador u otro sistema del SII: aparte. «${L.packAndando}» deja listo ${L.mp} para cobrar.`,
  },
];

const GLOSARIO_CLAVE: { term: string; mean: string }[] = [
  { term: L.tabletPedidos, mean: 'Pantalla donde el cliente arma su pedido y paga' },
  {
    term: L.maquinita,
    mean: 'Point: cobro con tarjeta en caja (aparte del pack; JobsHours puede facilitarla con precio claro)',
  },
  { term: L.pagoMes, mean: 'Lo que pagas cada mes para tener el programa activo' },
  { term: L.instalacion, mean: 'Trabajo una vez: dejarte listo para vender' },
];

const HARDWARE_OPCIONAL = [
  { name: 'Tablet 10" o tu PC', note: 'Te decimos qué comprar · $0 en catálogo' },
  {
    name: 'Maquinita Smart o Mini',
    note: `Compra en ${L.mp}, trae la tuya, o pídela a JobsHours (precio aparte acordado)`,
  },
  { name: 'Pantalla para el cliente', note: 'Opcional · solo si tu local lo necesita' },
  { name: 'Wi‑Fi estable', note: 'Lista antes de la visita' },
] as const;

function JhHeader() {
  const { store } = useCommerceStore();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3" title="Inicio JobsHours">
          <div className="jh-dashed-frame flex h-11 w-11 items-center justify-center bg-[var(--jh-green-soft)]">
            <span className="font-display text-sm font-extrabold text-[var(--jh-green-dark)]">JH</span>
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-[var(--jh-ink)]">
              {store?.brand?.title ?? 'JobsHours'}
            </span>
            <p className="text-[11px] font-medium text-[var(--jh-muted)]">{MARCA.madre}</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-semibold text-[var(--jh-muted)] md:flex">
          <Link href="/comida" className="hover:text-[var(--jh-green-dark)]">
            Comida
          </Link>
          <Link href="/minimarket" className="hover:text-[var(--jh-green-dark)]">
            Minimarket
          </Link>
          <a href="#modular" className="font-bold text-violet-700 hover:text-violet-900">
            Modular
          </a>
          <a href="#omnicanal" className="hover:text-[var(--jh-green-dark)]">
            Local mixto
          </a>
          <a href="#pagar" className="hover:text-[var(--jh-orange)]">
            Pagar
          </a>
          <a href="#faq" className="hover:text-[var(--jh-green-dark)]">
            FAQ
          </a>
        </nav>
        <Suspense>
          <CartButton />
        </Suspense>
      </div>
    </header>
  );
}

function RubroSelectorSection() {
  const doors = [
    {
      href: '#kiosko',
      title: 'Comida + fila',
      sub: 'Tablet de pedidos · cliente pide y paga solo',
      price: `desde ${formatCLP(PRECIOS.planMinimo)}/mes`,
      accent: 'border-[var(--jh-green)] bg-[var(--jh-green-soft)]',
      icon: UtensilsCrossed,
    },
    {
      href: '#retail',
      title: 'Minimarket',
      sub: 'Barra e inventario',
      price: `desde ${formatCLP(PRECIOS.planRetail)}/mes`,
      accent: 'border-[#2563eb] bg-[var(--jh-blue-soft)]',
      icon: ScanLine,
    },
    {
      href: '#omnicanal',
      title: 'Local mixto',
      sub: 'Comida + góndola · un inventario',
      price: 'Ver precios abajo',
      accent: 'border-violet-400 bg-violet-50',
      icon: MonitorSmartphone,
    },
  ] as const;

  return (
    <section id="rubros" className="scroll-mt-20 border-b border-slate-100 bg-white px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-sm font-bold text-[var(--jh-ink)]">¿Qué vendes principalmente?</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {doors.map(({ href, title, sub, price, accent, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className={`flex flex-col rounded-xl border-2 p-4 transition hover:shadow-md ${accent}`}
            >
              <Icon className="h-6 w-6 text-[var(--jh-ink)]" strokeWidth={2} />
              <span className="mt-2 font-display text-sm font-extrabold text-[var(--jh-ink)]">{title}</span>
              <span className="mt-1 text-xs font-medium text-[var(--jh-muted)]">{sub}</span>
              <span className="mt-2 text-[11px] font-bold text-[var(--jh-green-dark)]">{price}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function JhHero({ onBuyCombo }: { onBuyCombo: () => void }) {
  return (
    <section id="kiosko" className="scroll-mt-20 bg-[var(--jh-surface-alt)] px-4 py-10 md:py-14">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-10">
        {/* En móvil: el flyer primero vende mejor que el texto */}
        <div className="order-1 lg:order-2">
          <div className="jh-dashed-frame overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg">
            <Image
              src={FLYERS.kiosko}
              alt="JobsHours: tablet de pedidos, maquinita Mercado Pago, pedido a cocina"
              width={800}
              height={1000}
              className="h-auto w-full rounded-xl"
              priority
            />
          </div>
          <div className="mt-3 rounded-xl border border-[var(--jh-green)]/30 bg-white px-4 py-3 text-center shadow-sm lg:text-left">
            <p className="font-display text-lg font-extrabold text-[var(--jh-ink)]">
              Plan desde {formatCLP(PRECIOS.planMinimo)}
              <span className="text-sm font-semibold text-[var(--jh-muted)]">/mes + IVA</span>
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--jh-green-dark)]">
              ~{PRECIOS.roiPedidos} pedidos de {formatCLP(PRECIOS.roiTicket)} al mes cubren el plan
            </p>
            <p className="mt-2 text-[11px] font-medium text-[var(--jh-muted)]">
              Demo en vivo · Araucanía · Tablet de pedidos + maquinita de cobro (esta última aparte del pack)
            </p>
          </div>
        </div>

        <div className="order-2 text-center lg:order-1 lg:text-left">
          <span className="jh-badge jh-badge-blue mb-3">{MARCA.madre}</span>
          <h1 className="font-display text-3xl font-extrabold leading-[1.1] text-[var(--jh-ink)] sm:text-4xl lg:text-[2.65rem]">
            Tu cliente <span className="text-[var(--jh-green-dark)]">pide y paga solo.</span>
            <br />
            Tú te quedas <span className="text-[var(--jh-green-dark)]">en la cocina.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-[var(--jh-muted)] lg:mx-0">
            {MARCA.explainer}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-4 shadow-sm sm:gap-3 sm:px-4">
            {FLYER_BENEFITS.map(({ title, sub, icon: Icon }) => (
              <div key={title} className="text-center">
                <Icon className="mx-auto h-7 w-7 text-[var(--jh-green-dark)]" strokeWidth={2} />
                <p className="mt-2 text-xs font-extrabold text-[var(--jh-ink)] sm:text-sm">{title}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-[var(--jh-muted)] sm:text-xs">{sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
            <button type="button" onClick={onBuyCombo} className="jh-btn-primary w-full sm:w-auto">
              Comprar {L.packAndando} · {formatCLP(PRECIOS.comboFeria)}
            </button>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="jh-btn-secondary w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              ¿Dudas? WhatsApp
            </a>
            <a href="#pagar" className="jh-btn-secondary w-full text-center sm:w-auto">
              Ver formas de pago ↓
            </a>
          </div>
          <p className="mt-4 text-xs font-semibold text-[var(--jh-muted)]">
            Sanguchería · fuente · café · puesto en feria · rotisería —{' '}
            <a href="#planes" className="font-bold text-[var(--jh-green-dark)] hover:underline">
              comparar planes comida ↓
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/** Mismo layout que el hero kiosko, con el post JH-04 (caja minimarket) */
function JhRetailFlyerSection({
  planRetail,
  addonSoporte,
  srvMant,
  impActivacion,
  impCompleta,
  onBuyRetail,
  onAddRetailPlans,
}: {
  planRetail: Producto | undefined;
  addonSoporte: Producto | undefined;
  srvMant: Producto | undefined;
  impActivacion: Producto | undefined;
  impCompleta: Producto | undefined;
  onBuyRetail: () => void;
  onAddRetailPlans: (products: Producto[]) => void;
}) {
  return (
    <section id="retail" className="scroll-mt-20 border-y border-slate-100 bg-white px-4 py-10 md:py-14">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="order-1 lg:order-2">
          <div className="jh-dashed-frame-blue overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg">
            <Image
              src={FLYERS.retail}
              alt="JobsHours Caja Minimarket: lector de barras, inventario y alertas en pantalla"
              width={800}
              height={1000}
              className="h-auto w-full rounded-xl"
            />
          </div>
          <div className="mt-3 rounded-xl border border-[var(--jh-blue)]/35 bg-[var(--jh-blue-soft)] px-4 py-3 text-center shadow-sm lg:text-left">
            <p className="font-display text-lg font-extrabold text-[var(--jh-ink)]">
              Barra e inventario · {formatCLP(PRECIOS.planRetail)}
              <span className="text-sm font-semibold text-[var(--jh-muted)]">/mes + IVA</span>
            </p>
            <p className="mt-1 text-xs font-semibold text-[#1d4ed8]">
              Funciona en tu PC o tablet · conectas tu lector USB
            </p>
            <p className="mt-2 text-[11px] font-medium text-[var(--jh-muted)]">
              No es tablet de pedidos de comida — es caja clásica con inventario y avisos cuando falta producto
            </p>
          </div>
        </div>

        <div className="order-2 text-center lg:order-1 lg:text-left">
          <span className="jh-badge jh-badge-blue mb-3">{RETAIL_MARCA.badge}</span>
          <h2 className="font-display text-3xl font-extrabold leading-[1.1] text-[var(--jh-ink)] sm:text-4xl lg:text-[2.65rem]">
            {RETAIL_MARCA.headline[0]}{' '}
            <span className="text-[#2563eb]">{RETAIL_MARCA.headline[1]}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-[var(--jh-muted)] lg:mx-0">
            {RETAIL_MARCA.explainer}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 border-y border-slate-200 py-3">
            {RETAIL_STEPS.map(({ title, sub }) => (
              <div key={title} className="text-center">
                <p className="text-xs font-extrabold text-[var(--jh-ink)] sm:text-sm">{title}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-[var(--jh-muted)] sm:text-xs">{sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-4 shadow-sm sm:gap-3 sm:px-4">
            {RETAIL_BENEFITS.map(({ title, sub, icon: Icon }) => (
              <div key={title} className="text-center">
                <Icon className="mx-auto h-7 w-7 text-[#2563eb]" strokeWidth={2} />
                <p className="mt-2 text-xs font-extrabold text-[var(--jh-ink)] sm:text-sm">{title}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-[var(--jh-muted)] sm:text-xs">{sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
            {planRetail ? (
              <button type="button" onClick={onBuyRetail} className="jh-btn-primary w-full sm:w-auto">
                Comprar barra e inventario · {formatCLP(PRECIOS.planRetail)}/mes
              </button>
            ) : (
              <a href={WA_RETAIL_LINK} className="jh-btn-primary w-full sm:w-auto">
                Consultar caja minimarket
              </a>
            )}
            <a
              href={WA_RETAIL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="jh-btn-secondary w-full sm:w-auto"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              ¿Dudas? WhatsApp
            </a>
          </div>
          <p className="mt-4 text-xs font-semibold text-[var(--jh-muted)]">
            Almacén · ferretería · minimarket · bodega —{' '}
            <a href="#retail-planes" className="font-bold text-[#2563eb] hover:underline">
              ver precios de caja ↓
            </a>
            {' · '}
            <a href="#planes" className="font-bold text-[var(--jh-green-dark)] hover:underline">
              ¿Comida con fila? Ver tablet de pedidos ↑
            </a>
          </p>
        </div>
      </div>

      <RetailPlansChecklistSection
        planRetail={planRetail}
        addonSoporte={addonSoporte}
        srvMant={srvMant}
        impActivacion={impActivacion}
        impCompleta={impCompleta}
        onSelectPlan={onBuyRetail}
        onAddPlans={onAddRetailPlans}
      />
    </section>
  );
}

/** Checklist hosting · línea minimarket */
function RetailPlansChecklistSection({
  planRetail,
  addonSoporte,
  srvMant,
  impActivacion,
  impCompleta,
  onSelectPlan,
  onAddPlans,
}: {
  planRetail: Producto | undefined;
  addonSoporte: Producto | undefined;
  srvMant: Producto | undefined;
  impActivacion: Producto | undefined;
  impCompleta: Producto | undefined;
  onSelectPlan: () => void;
  onAddPlans: (products: Producto[]) => void;
}) {
  const cols = [
    {
      key: 'basico',
      name: 'Solo caja',
      line: 'Escaneas y ves el inventario',
      price: PRECIOS.planRetail,
      highlight: false,
    },
    {
      key: 'soporte',
      name: 'Caja + ayuda rápida',
      line: 'Prioridad por WhatsApp',
      price: PRECIOS.planRetail + PRECIOS.addonSoporte,
      highlight: true,
    },
    {
      key: 'mant',
      name: 'Caja + revisión mensual',
      line: 'Te revisamos el sistema',
      price: PRECIOS.planRetail + PRECIOS.srvMant,
      highlight: false,
    },
  ] as const;

  const mainRows: { label: string; values: (boolean | string)[] }[] = [
    { label: 'Caja + lector código de barras (USB)', values: [true, true, true] },
    { label: 'Inventario y aviso cuando falta producto', values: [true, true, true] },
    { label: 'Reportes de ventas e inventario', values: [true, true, true] },
    { label: 'Múltiples usuarios y roles por caja', values: [true, true, true] },
    { label: 'Mercado Pago', values: [true, true, true] },
    { label: 'Funciona en PC o tablet del local', values: [true, true, true] },
    { label: 'Soporte WhatsApp Lun–Sáb 09–21 h', values: [true, true, true] },
    { label: 'WhatsApp con respuesta más rápida', values: [false, true, true] },
    { label: 'Revisión mensual del sistema (1 h)', values: [false, false, true] },
  ];

  const setupRows: { label: string; solo: boolean | string; activacion: boolean | string; completo: boolean | string }[] =
    [
      { label: 'Programa de caja listo', solo: true, activacion: true, completo: true },
      { label: 'Instalación remota o en tu local', solo: false, activacion: 'Remoto', completo: true },
      { label: 'Capacitación en tu PC', solo: false, activacion: true, completo: true },
    ];

  const pickColumn = (key: (typeof cols)[number]['key']) => {
    if (!planRetail) return;
    if (key === 'basico') {
      onSelectPlan();
      return;
    }
    if (key === 'soporte' && addonSoporte) {
      onAddPlans([planRetail, addonSoporte]);
      return;
    }
    if (key === 'mant' && srvMant) {
      onAddPlans([planRetail, srvMant]);
    }
  };

  return (
    <div id="retail-planes" className="scroll-mt-24 mx-auto mt-14 max-w-6xl border-t border-slate-200 pt-12">
      <h3 className="jh-section-title text-center text-2xl md:text-3xl">¿Cuánta ayuda quieres con la caja?</h3>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm font-semibold text-[var(--jh-ink)]">
        Cada columna incluye la de la izquierda. Mira solo el precio que te calza.
      </p>

      <div className="jh-compare-wrap mt-8">
        <table className="jh-compare-table">
          <thead>
            <tr>
              <th>¿Qué trae?</th>
              {cols.map((c) => (
                <th key={c.key} className={c.highlight ? 'col-highlight-blue' : ''}>
                  <div className="font-display text-base leading-tight">{c.name}</div>
                  <div className="mt-1 text-[10px] font-medium leading-snug text-[var(--jh-muted)]">
                    {c.line}
                  </div>
                  <div className="mt-2 text-lg font-extrabold text-[#2563eb]">
                    {formatCLP(c.price)}
                    <span className="text-xs font-semibold text-[var(--jh-muted)]">/mes</span>
                  </div>
                  {planRetail && (
                    <button
                      type="button"
                      onClick={() => pickColumn(c.key)}
                      className="jh-btn-secondary mt-2 !px-3 !py-1.5 text-[11px]"
                    >
                      Quiero este
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mainRows.map(({ label, values }) => (
              <tr key={label}>
                <td>{label}</td>
                {values.map((v, i) => (
                  <td
                    key={cols[i].key}
                    className={cols[i].highlight ? 'col-highlight-blue text-center' : 'text-center'}
                  >
                    <CheckCell value={v} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-xs font-semibold text-[var(--jh-muted)]">
        En todos: tú compras PC o tablet y lector USB · JobsHours configura caja, inventario y Mercado Pago
      </p>

      <h4 className="mt-12 text-center font-display text-lg font-bold text-[var(--jh-ink)]">
        ¿Cómo quieres arrancar?
      </h4>
      <p className="mt-2 text-center text-sm text-[var(--jh-muted)]">
        No es otro pago de cada mes: es si pagas instalación hoy además del mes 1.
      </p>
      <div className="jh-compare-wrap mx-auto mt-6 max-w-2xl">
        <table className="jh-compare-table" style={{ minWidth: 400 }}>
          <thead>
            <tr>
              <th />
              <th>Solo el programa</th>
              <th className="col-highlight-blue">+ Conexión remota</th>
              <th>+ Instalación completa</th>
            </tr>
            <tr>
              <td />
              <td className="text-center font-extrabold">{formatCLP(PRECIOS.planRetail)}</td>
              <td className="col-highlight-blue text-center font-extrabold text-[#2563eb]">
                {formatCLP(PRECIOS.planRetail + PRECIOS.implActivacion)}
              </td>
              <td className="text-center font-extrabold">
                {formatCLP(PRECIOS.planRetail + PRECIOS.implCompleta)}
              </td>
            </tr>
          </thead>
          <tbody>
            {setupRows.map(({ label, solo, activacion, completo }) => (
              <tr key={label}>
                <td>{label}</td>
                <td className="text-center">
                  <CheckCell value={solo} />
                </td>
                <td className="col-highlight-blue text-center">
                  <CheckCell value={activacion} />
                </td>
                <td className="text-center">
                  <CheckCell value={completo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {planRetail && (
          <button type="button" onClick={onSelectPlan} className="jh-btn-secondary text-sm">
            Solo caja · {formatCLP(PRECIOS.planRetail)}/mes
          </button>
        )}
        {planRetail && impActivacion && (
          <button
            type="button"
            onClick={() => onAddPlans([planRetail, impActivacion])}
            className="jh-btn-primary text-sm"
          >
            Caja + conexión remota · {formatCLP(PRECIOS.planRetail + PRECIOS.implActivacion)}
          </button>
        )}
        {planRetail && impCompleta && (
          <button
            type="button"
            onClick={() => onAddPlans([planRetail, impCompleta])}
            className="jh-btn-secondary text-sm"
          >
            Caja + instalación · {formatCLP(PRECIOS.planRetail + PRECIOS.implCompleta)}
          </button>
        )}
      </div>
    </div>
  );
}

/** Hub omnicanal: post integrado + rutas a checklists (sin duplicar tablas) */
function JhOmnicanalHubSection() {
  const rutas = [
    {
      href: '#retail-planes',
      badge: 'Minimarket',
      title: PLAN_PUBLIC['JH-04'].title,
      line: PLAN_PUBLIC['JH-04'].line,
      price: formatCLP(PRECIOS.planRetail),
    },
    {
      href: '#planes',
      badge: 'Comida con fila',
      title: 'De menos filas a vender en web',
      line: `${PLAN_PUBLIC['JH-01'].title} → ${PLAN_PUBLIC['JH-03'].title}`,
      price: `${formatCLP(PRECIOS.planMinimo)} – ${formatCLP(PRECIOS.planOmni)}`,
    },
    {
      href: '#pagar',
      badge: 'Recomendado',
      title: L.packAndando,
      line: 'Instalación + primer mes en un solo pago',
      price: formatCLP(PRECIOS.comboFeria),
    },
  ] as const;

  return (
    <section
      id="omnicanal"
      className="scroll-mt-20 border-y border-slate-100 bg-gradient-to-b from-slate-50 to-white px-4 py-10 md:py-14"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <span className="jh-badge jh-badge-blue mb-3">JobsHours · Local mixto</span>
            <h2 className="font-display text-3xl font-extrabold leading-[1.1] text-[var(--jh-ink)] sm:text-4xl">
              Un negocio.{' '}
              <span className="text-[var(--jh-green-dark)]">Un inventario.</span>
              <br />
              Cuatro formas de vender.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-[var(--jh-muted)] lg:mx-0">
              Para locales mixtos: comida en mostrador + góndola + bebidas. La caja no es la única que
              trabaja — el celular suma venta en el piso e inventario, todo en un solo programa JobsHours.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {OMNI_PILLARS.map(({ n, title, sub, icon: Icon }) => (
                <div
                  key={n}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm"
                >
                  <span className="text-[10px] font-extrabold text-[#2563eb]">{n}</span>
                  <Icon className="mx-auto mt-1 h-6 w-6 text-[var(--jh-green-dark)]" strokeWidth={2} />
                  <p className="mt-1.5 text-[11px] font-extrabold leading-tight text-[var(--jh-ink)]">
                    {title}
                  </p>
                  <p className="mt-0.5 text-[9px] font-semibold text-[var(--jh-muted)]">{sub}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-start">
              <a
                href={WA_OMNI_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="jh-btn-primary w-full sm:w-auto"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                Cotizar local mixto · WhatsApp
              </a>
              <a href="#omnicanal-rutas" className="jh-btn-secondary w-full sm:w-auto">
                Ver precios por rubro ↓
              </a>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-2xl border-2 border-dashed border-[var(--jh-green)] bg-white p-1.5 shadow-lg">
              <Image
                src={FLYERS.ecosistemaIntegrado}
                alt="JobsHours local mixto: vendedor con celular, inventario en bodega, tablet de pedidos y tienda web"
                width={1200}
                height={900}
                className="h-auto w-full rounded-xl"
              />
            </div>
            <p className="mt-3 text-center text-[11px] font-medium text-[var(--jh-muted)] lg:text-left">
              Un inventario central · caja, celular en piso y venta por internet
            </p>
          </div>
        </div>

        <div id="omnicanal-rutas" className="scroll-mt-24 mt-14 border-t border-slate-200 pt-10">
          <h3 className="text-center font-display text-xl font-bold text-[var(--jh-ink)]">
            Local mixto: elige por rubro
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--jh-muted)]">
            No repetimos la misma tabla aquí. Cada rubro tiene su comparativa abajo; tú combinas lo que
            necesites.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {rutas.map(({ href, badge, title, line, price }) => (
              <a
                key={href}
                href={href}
                className="jh-card block border-l-4 border-[var(--jh-green)] p-5 transition hover:border-[#2563eb]"
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--jh-muted)]">
                  {badge}
                </span>
                <p className="mt-1 font-display font-bold text-[var(--jh-ink)]">{title}</p>
                <p className="mt-1 text-xs font-medium text-[var(--jh-muted)]">{line}</p>
                <p className="mt-2 font-display text-lg font-extrabold text-[var(--jh-green-dark)]">
                  {price}
                </p>
              </a>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[var(--jh-muted)]">
            ¿Comida y góndola juntos?{' '}
            <a href={WA_OMNI_LINK} className="font-bold text-[var(--jh-green-dark)] hover:underline">
              Cotizar mix por WhatsApp
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

function CheckCell({ value }: { value: boolean | string }) {
  if (value === true) return <span className="jh-check-yes">✓</span>;
  if (value === false) return <span className="jh-check-no">—</span>;
  return <span className="text-xs font-semibold text-[var(--jh-muted)]">{value}</span>;
}

function DosTiposDePagoSection({ compact }: { compact?: boolean }) {
  return (
    <section
      id="que-pagas"
      className={compact ? 'mt-10' : 'scroll-mt-20 border-b border-slate-100 bg-[var(--jh-green-soft)] px-4 py-12'}
    >
      <div className={compact ? '' : 'mx-auto max-w-6xl'}>
        {!compact && (
          <h2 className="jh-section-title text-center">Dos pagos distintos (para que no haya sorpresas)</h2>
        )}
        {compact && (
          <h3 className="text-center font-display text-lg font-bold text-[var(--jh-ink)]">
            Antes de pagar: pago de cada mes ≠ instalación
          </h3>
        )}
        <p className={`mx-auto max-w-2xl text-center text-sm text-[var(--jh-muted)] ${compact ? 'mt-2' : 'mt-3'}`}>
          El <strong className="text-[var(--jh-ink)]">pago de cada mes</strong> mantiene el programa activo. La{' '}
          <strong className="text-[var(--jh-ink)]">instalación</strong> es trabajo humano una vez (Mercado Pago, menú,
          visita). Se cobran por separado; con «{L.packAndando}» pagas ambos en un solo cobro hoy.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="jh-card border-l-4 border-[var(--jh-green)] p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--jh-green-dark)]">
              Cada mes · pago del programa
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold text-[var(--jh-ink)]">
              {formatCLP(PRECIOS.planMinimo)}
              <span className="text-sm font-semibold text-[var(--jh-muted)]">/mes + IVA</span>
            </p>
            <p className="mt-2 text-xs font-semibold text-[var(--jh-muted)]">
              Plan «Menos filas». Sin esto el programa no queda activo el mes siguiente.
            </p>
            <ul className="mt-4 space-y-2">
              {PAGO_MENSUAL_INCLUYE.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-[var(--jh-ink)]">
                  <span className="font-bold text-[var(--jh-green-dark)]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-[var(--jh-muted)]">
              No incluye visita nueva ni alta de Mercado Pago desde cero si no contrataste instalación.
            </p>
          </article>

          <article className="jh-card border-l-4 border-[var(--jh-orange)] p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--jh-orange)]">
              Una vez · instalación
            </p>
            <p className="mt-2 font-display text-2xl font-extrabold text-[var(--jh-ink)]">
              desde {formatCLP(PRECIOS.implActivacion)}
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--jh-orange)]">
              Con visita: {formatCLP(PRECIOS.implFeria)} · Completa en local: {formatCLP(PRECIOS.implCompleta)}
            </p>
            <p className="mt-2 text-xs font-semibold text-[var(--jh-muted)]">
              Pago único por dejarte vendiendo (no es otro cobro mensual).
            </p>
            <ul className="mt-4 space-y-3">
              {PAGO_IMPL_INCLUYE.map(({ title, detail }) => (
                <li key={title}>
                  <p className="text-sm font-bold text-[var(--jh-ink)]">✓ {title}</p>
                  <p className="text-[11px] leading-snug text-[var(--jh-muted)]">{detail}</p>
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-dashed border-[var(--jh-orange)] bg-white p-4 md:p-5">
          <p className="text-center font-display text-sm font-bold text-[var(--jh-ink)] md:text-base">
            {L.packAndando} {formatCLP(PRECIOS.comboFeria)} = instalación {formatCLP(PRECIOS.implFeria)} + primer mes{' '}
            {formatCLP(PRECIOS.planMinimo)}
          </p>
          <p className="mt-2 text-center text-xs text-[var(--jh-muted)]">
            No es un precio “mágico”: son dos conceptos en un solo pago hoy. Después solo{' '}
            {formatCLP(PRECIOS.planMinimo)}/mes por el programa.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-center text-xs font-bold uppercase tracking-wide text-[var(--jh-muted)]">
            En 5 segundos
          </p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {GLOSARIO_CLAVE.map(({ term, mean }) => (
              <div key={term} className="text-xs">
                <dt className="font-bold text-[var(--jh-ink)]">{term}</dt>
                <dd className="text-[var(--jh-muted)]">{mean}</dd>
              </div>
            ))}
          </dl>
        </div>

        <details className="mt-4 jh-card p-0">
          <summary className="cursor-pointer px-5 py-4 font-display text-sm font-bold text-[var(--jh-ink)]">
            ¿Qué puede cotizarse aparte? (no va incluido sin contratarlo)
          </summary>
          <ul className="space-y-3 border-t border-slate-100 px-5 pb-4 pt-3">
            {PAGO_APARTE_OPCIONAL.map(({ title, detail }) => (
              <li key={title}>
                <p className="text-sm font-semibold text-[var(--jh-ink)]">○ {title}</p>
                <p className="text-[11px] text-[var(--jh-muted)]">{detail}</p>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}

function IncluyeTuComprasSection() {
  return (
    <section id="incluye" className="scroll-mt-20 border-b border-slate-100 bg-white px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="jh-section-title text-center text-xl md:text-2xl">Qué incluye JobsHours y qué compras tú</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--jh-muted)]">
          Sin sorpresas: programa e instalación son JobsHours. Tablet de pedidos y maquinita de cobro son equipos tuyos
          (la tablet puede ir en Pack Express; la maquinita casi siempre aparte).
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="jh-card border-l-4 border-[var(--jh-green)] p-5">
            <h3 className="font-display font-bold text-[var(--jh-ink)]">JobsHours incluye</h3>
            <ul className="mt-4 space-y-2">
              {INCLUYE_JH.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-[var(--jh-ink)]">
                  <span className="font-bold text-[var(--jh-green-dark)]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="jh-card border-l-4 border-slate-300 p-5">
            <h3 className="font-display font-bold text-[var(--jh-ink)]">Tú compras aparte</h3>
            <ul className="mt-4 space-y-2">
              {COMPRA_TU.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-[var(--jh-muted)]">
                  <span className="font-bold text-slate-400">○</span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

function PagarFeriaSection({
  planBase,
  comboFeria,
  onBuyPlan,
  onBuyCombo,
}: {
  planBase: Producto | undefined;
  comboFeria: Producto | undefined;
  onBuyPlan: () => void;
  onBuyCombo: () => void;
}) {
  return (
    <section id="pagar" className="scroll-mt-20 border-b border-slate-100 bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="jh-section-title text-center">Pagar hoy (comida con fila)</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--jh-muted)]">
          <a href="#que-pagas" className="font-bold text-[var(--jh-green-dark)] hover:underline">
            Ver pago de cada mes vs instalación ↓
          </a>
          {' · '}
          Minimarket:{' '}
          <a href="#retail-planes" className="font-bold text-[#2563eb] hover:underline">
            barra e inventario
          </a>
        </p>

        <p className="mx-auto mt-6 max-w-lg text-center text-xs text-[var(--jh-muted)]">
          El desglose completo está en la sección de arriba («Dos pagos distintos»).
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <article className="jh-card flex flex-col border-l-4 border-[var(--jh-green)]">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--jh-green-dark)]">
              Opción 1 · solo pago del mes
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold">Primer mes del programa</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--jh-muted)]">
              Pagas hoy solo el primer mes ({formatCLP(PRECIOS.planMinimo)}). Para dejar la tablet de pedidos
              funcionando en tu local, la <strong>instalación es aparte</strong> (desde{' '}
              {formatCLP(PRECIOS.implActivacion)} si ya tienes tablet y maquinita).
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-[var(--jh-muted)]">
              <p className="font-bold text-[var(--jh-ink)]">Hoy pagas</p>
              <p>Primer mes: {formatCLP(PRECIOS.planMinimo)}</p>
              <p className="mt-1 font-bold text-[var(--jh-ink)]">Después cada mes</p>
              <p>{formatCLP(PRECIOS.planMinimo)}/mes</p>
            </div>
            {planBase ? (
              <button type="button" onClick={onBuyPlan} className="jh-btn-secondary mt-6">
                Pagar solo primer mes
              </button>
            ) : (
              <a href="#precios" className="jh-btn-secondary mt-6 text-center">
                Ver detalle
              </a>
            )}
          </article>

          <article className="jh-card flex flex-col border-l-4 border-[var(--jh-orange)] ring-2 ring-[var(--jh-orange)]/25">
            <span className="text-xs font-bold uppercase tracking-wide text-[var(--jh-orange)]">
              Opción 2 · instalación + primer mes
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold">Te lo dejamos andando</h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--jh-muted)]">
              Un pago hoy con <strong>dos partes</strong>: instalación en tu local (Mercado Pago, menú, visita) + tu
              primer mes del programa.
            </p>
            <div className="mt-4 space-y-1 rounded-xl border border-[var(--jh-orange)]/30 bg-[#fff7ed] px-3 py-2 text-xs">
              <div className="flex justify-between gap-2">
                <span>Instalación (una vez)</span>
                <span className="font-bold">{formatCLP(PRECIOS.implFeria)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Primer mes del programa</span>
                <span className="font-bold">{formatCLP(PRECIOS.planMinimo)}</span>
              </div>
              <div className="flex justify-between gap-2 border-t border-[var(--jh-orange)]/20 pt-1 font-bold text-[var(--jh-ink)]">
                <span>Total hoy</span>
                <span>{formatCLP(PRECIOS.comboFeria)}</span>
              </div>
              <p className="pt-1 text-[var(--jh-muted)]">Luego {formatCLP(PRECIOS.planMinimo)}/mes solo el programa</p>
            </div>
            {comboFeria && (
              <button type="button" onClick={onBuyCombo} className="jh-btn-primary mt-6">
                Pagar instalación + mes 1
              </button>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

function HowWeWorkSection() {
  return (
    <section className="border-t border-slate-100 bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="jh-section-title">Cómo trabajamos</h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: 'Conversamos', d: 'Entendemos tu local y tu menú.', icon: Users },
            { t: 'Instalación', d: 'Tablet, Mercado Pago y menú listos.', icon: Wrench },
            { t: 'Te enseñamos', d: '30 min y operas solo.', icon: MonitorSmartphone },
            { t: 'Soporte', d: 'Lun–Sáb por WhatsApp.', icon: Headphones },
          ].map(({ t, d, icon: Icon }) => (
            <li key={t} className="jh-card text-center">
              <Icon className="mx-auto h-8 w-8 text-[var(--jh-orange)]" />
              <h3 className="mt-3 font-display font-bold">{t}</h3>
              <p className="mt-1 text-sm text-[var(--jh-muted)]">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function OfficialPricingSection() {
  const [open, setOpen] = useState(false);
  const rows = [
    { label: 'Menos filas (pago cada mes)', price: `${formatCLP(PRECIOS.planMinimo)}/mes`, note: 'Tablet de pedidos' },
    { label: `${L.packAndando} (instalación + mes 1)`, price: formatCLP(PRECIOS.comboFeria), note: `${formatCLP(PRECIOS.implFeria)} + 1er mes` },
    { label: 'Instalación completa (tú pones tablet)', price: formatCLP(PRECIOS.implCompleta), note: 'Visita + enseñanza' },
    { label: 'Instalación con visita', price: formatCLP(PRECIOS.implFeria), note: 'Mercado Pago, menú, prueba' },
    { label: 'Solo conectar (ya tienes tablet y maquinita)', price: formatCLP(PRECIOS.implActivacion), note: 'Por videollamada' },
    { label: 'Menos WhatsApp', price: `${formatCLP(PRECIOS.planIA)}/mes`, note: 'Incluye Menos filas' },
    { label: 'Todo con equipos (referencia)', price: formatCLP(PRECIOS.llaveEnMano), note: 'Tablet+maquinita+visita · cotizar' },
  ];

  return (
    <section id="precios" className="bg-[var(--jh-surface-alt)] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left"
        >
          <div>
            <p className="font-display font-bold text-[var(--jh-ink)]">Todos los precios</p>
            <p className="text-sm text-[var(--jh-muted)]">Programa mensual, instalación y extras</p>
          </div>
          <ChevronDown className={`h-5 w-5 shrink-0 text-[var(--jh-green)] ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <>
            <p className="mt-3 text-center text-sm text-[var(--jh-muted)]">
              Mismos valores en esta tienda y por WhatsApp. + IVA si aplica.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-4 py-3 font-bold text-[var(--jh-ink)]">Concepto</th>
                <th className="px-4 py-3 font-bold text-[var(--jh-ink)]">Precio</th>
                <th className="hidden px-4 py-3 font-bold text-[var(--jh-ink)] sm:table-cell">Nota</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ label, price, note }) => (
                <tr key={label} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 text-[var(--jh-ink)]">{label}</td>
                  <td className="px-4 py-3 font-bold text-[var(--jh-green-dark)]">{price}</td>
                  <td className="hidden px-4 py-3 text-[var(--jh-muted)] sm:table-cell">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function HardwareModularSection({ onConfigure }: { onConfigure: () => void }) {
  return (
    <section id="hardware" className="bg-[var(--jh-surface-alt)] px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="jh-section-title text-center">¿Qué equipo necesitas?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--jh-muted)]">
          No te obligamos a comprar un pack cerrado. Eliges tablet, maquinita o pantalla según tu local.{' '}
          <strong className="font-semibold text-[var(--jh-ink)]">JobsHours se encarga de todo lo demás.</strong>
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <article className="jh-card border-l-4 border-[var(--jh-green)]">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[var(--jh-green-dark)]" />
                <h3 className="font-display font-bold">Nosotros nos encargamos</h3>
              </div>
              <ul className="mt-4 space-y-2">
                {JH_ENCARGA.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[var(--jh-ink)]">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--jh-green)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="jh-card border-l-4 border-[var(--jh-orange)]">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[var(--jh-orange)]" />
                <h3 className="font-display font-bold">Tú eliges (opcional)</h3>
              </div>
              <ul className="mt-4 space-y-3">
                {HARDWARE_OPCIONAL.map(({ name, note }) => (
                  <li key={name}>
                    <p className="text-sm font-semibold text-[var(--jh-ink)]">{name}</p>
                    <p className="text-xs text-[var(--jh-muted)]">{note}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl bg-[var(--jh-green-soft)] px-3 py-2 text-xs text-[var(--jh-ink)]">
                ¿Ya tienes tablet y maquinita? Solo conexión remota desde {formatCLP(PRECIOS.implActivacion)}.
              </p>
            </article>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <Image
              src={FLYERS.instalacion}
              alt="Instalación JobsHours: llegamos, configuramos, capacitamos"
              width={900}
              height={700}
              className="h-auto w-full"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={onConfigure} className="jh-btn-primary">
            <Sparkles className="h-4 w-4" />
            Armar mi compra a medida
          </button>
          <p className="text-center text-xs text-[var(--jh-muted)] sm:text-left">
            Todo incluido con equipos: desde {formatCLP(PRECIOS.llaveEnMano)} · cotizar por WhatsApp
          </p>
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return <JhTestimonialBlock />;
}

function AdvancedSection({
  configurador,
  extraCount,
  showExtra,
  setShowExtra,
  extraProducts,
  onConfigure,
  loading,
}: {
  configurador: Producto | undefined;
  extraCount: number;
  showExtra: boolean;
  setShowExtra: (v: boolean) => void;
  extraProducts: Producto[];
  onConfigure: (p: Producto) => void;
  loading: boolean;
}) {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-4">
        {configurador && (
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-display font-bold text-[var(--jh-ink)]">¿Necesitas personalizar?</p>
              <p className="mt-1 text-sm text-[var(--jh-muted)]">
                Elige plan + instalación + extras. Solo si ya viste las 2 ofertas de arriba.
              </p>
            </div>
            <button type="button" onClick={() => onConfigure(configurador)} className="jh-btn-secondary shrink-0">
              <Sparkles className="h-4 w-4" />
              Armar mi compra
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowExtra(!showExtra)}
          className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left"
        >
          <div>
            <p className="font-semibold text-[var(--jh-ink)]">Servicios adicionales ({extraCount})</p>
            <p className="text-sm text-[var(--jh-muted)]">Boleta legal, empresa, proyectos grandes — a pedido</p>
          </div>
          <ChevronDown className={`h-5 w-5 text-[var(--jh-green)] ${showExtra ? 'rotate-180' : ''}`} />
        </button>
        {showExtra && !loading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {extraProducts.map((p) => (
              <article key={p.idproducto} className="jh-card p-4">
                <h3 className="text-sm font-bold">{p.nombre}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--jh-muted)]">{p.descripcion}</p>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="font-bold">
                    {(p.precio_venta ?? 0) <= 0 ? 'Cotizar' : formatCLP(p.precio_venta ?? 0)}
                  </span>
                  <Link href={`/producto/${p.idproducto}`} className="text-[var(--jh-green-dark)] font-bold text-xs">
                    Ver
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FaqSection() {
  const faqs = [
    {
      q: '¿Qué estoy comprando exactamente?',
      a: 'Un programa para que tus clientes pidan y paguen solos en una tablet (o en caja minimarket). Pagas cada mes para mantenerlo activo, o pagas instalación una vez para que vayamos a dejarte listo.',
    },
    {
      q: '¿Para qué negocios sirve?',
      a: 'Fuente, sanguchería, café, heladería, puesto en feria callejera, rotisería y similares con fila en mostrador. Minimarket con lector o local con comida + góndola tiene otros precios en la misma tienda.',
    },
    {
      q: '¿Cuál es la diferencia entre $29.990 y $109.990?',
      a: `$29.990 es solo el primer mes del programa (tú o nosotros después configuran la tablet). $109.990 es «${L.packAndando}»: instalación ${formatCLP(PRECIOS.implFeria)} (Mercado Pago, menú, visita, enseñanza) + primer mes ${formatCLP(PRECIOS.planMinimo)} en un solo pago hoy. Después siempre ${formatCLP(PRECIOS.planMinimo)}/mes.`,
    },
    {
      q: '¿Por qué la instalación no viene en los $29.990/mes?',
      a: 'El pago mensual es por usar el programa y el soporte. La instalación es trabajo una vez: revisar tu Mercado Pago, cargar el menú, conectar la maquinita y enseñarte. Si solo pagas el mes, eso no incluye visita ni alta completa.',
    },
    {
      q: '¿Incluye boleta al SII o abrir la empresa?',
      a: `No en «${L.packAndando}» ni en $29.990/mes. Eso se cotiza aparte con contador si lo necesitas. Lo que sí dejamos listo es cobrar con Mercado Pago y que el cliente pida en la tablet.`,
    },
    {
      q: '¿Ustedes venden la tablet y la maquinita?',
      a: `El Pack Express incluye tablet de pedidos, no la maquinita Point. La maquinita la compras en Mercado Pago, usas la que ya tienes, o JobsHours puede entregártela/revenderla con precio aparte siempre acordado antes de pagar. Nosotros vendemos el programa y la instalación.`,
    },
    {
      q: '¿Para qué sirve la maquinita si ya tengo tablet?',
      a: 'La tablet es para que el cliente pida. La maquinita es para cobrar tarjeta en caja sin depender del celular del dueño. Sin maquinita puedes cobrar con QR en celular; con Point la fila de pago es más rápida.',
    },
    {
      q: '¿Es lo mismo que Bsale o una caja cualquiera?',
      a: 'No. JobsHours es para comida con fila: el cliente pide y paga en la tablet y tú cocinas. No es un ERP ni una caja de supermercado genérica.',
    },
    {
      q: '¿Qué significan Menos filas, Menos WhatsApp y También en web?',
      a: `«Menos filas» (${formatCLP(PRECIOS.planMinimo)}/mes): tablet de pedidos básica. «Menos WhatsApp» (${formatCLP(PRECIOS.planIA)}/mes): suma respuestas automáticas en WhatsApp. «También en web» (${formatCLP(PRECIOS.planOmni)}/mes): suma vender por internet con el mismo inventario. Cada nivel incluye el anterior.`,
    },
  ];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-[var(--jh-surface-alt)] px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="jh-section-title text-center">Preguntas frecuentes</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((item, i) => (
            <div key={item.q} className="jh-card overflow-hidden p-0">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-display text-sm font-bold md:text-base">{item.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-[var(--jh-green)] ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <p className="border-t border-slate-100 px-5 pb-4 pt-2 text-sm text-[var(--jh-muted)]">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JhFooter() {
  return (
    <footer id="contacto" className="bg-[var(--jh-ink)] px-4 py-12 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
        <div>
          <span className="font-display text-xl font-bold text-white">JobsHours</span>
          <p className="mt-3 max-w-sm text-sm">{MARCA.madre} · Araucanía, Chile</p>
        </div>
        <div className="text-sm">
          <a href={WA_LINK} className="font-semibold text-white hover:text-[var(--jh-green)]">
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
          <p className="mt-2 text-slate-400">Lun–Sáb 09:00–21:00</p>
          <Link href="/cart" className="mt-3 inline-block text-[var(--jh-orange)]">
            Ir al carrito →
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function JobshoursCatalogPage() {
  const { addToCart } = useCart();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [builderProduct, setBuilderProduct] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExtra, setShowExtra] = useState(false);
  const [rubro, setRubro] = useState<CatalogRubro>('comida');

  useEffect(() => {
    setRubro(rubroFromHash(window.location.hash));
    const onHash = () => setRubro(rubroFromHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash === '#modular') {
      requestAnimationFrame(() => {
        document.getElementById('modular')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  useEffect(() => {
    apiFetch('/api/productos?orden=nombre&per_page=100')
      .then((r) => r.json())
      .then((prodPage) => {
        const list = prodPage?.data ?? prodPage ?? [];
        setProductos(Array.isArray(list) ? list : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const bySku = useMemo(() => {
    const map = new Map<string, Producto>();
    for (const p of productos) {
      if (p.codigobarra) map.set(p.codigobarra, p);
    }
    return map;
  }, [productos]);

  const planBase = bySku.get('JH-01');
  const planRetail = bySku.get('JH-04');
  const addonSoporte = bySku.get('JH-ADD-SOP');
  const srvMant = bySku.get('JH-SRV-MANT');
  const impActivacion = bySku.get('JH-IMP-30');
  const impCompleta = bySku.get('JH-IMP-100');
  const comboFeria = bySku.get('JH-PKG-FERIA');
  const configurador = bySku.get('JH-CFG-AUTO');
  const extraProducts = useMemo(
    () =>
      productos.filter((p) => {
        const sku = p.codigobarra ?? '';
        if ([...PLAN_SKUS, 'JH-CFG-AUTO', 'JH-PKG-FERIA'].includes(sku)) return false;
        if (sku.startsWith('JH-INT-')) return false;
        if (sku.startsWith('JH-HW-')) return false;
        return true;
      }),
    [productos],
  );

  const addPlanToCart = (p: Producto) => {
    addToCart({
      idproducto: p.idproducto,
      nombre: p.nombre,
      precio_venta: p.precio_venta ?? PRECIOS.planMinimo,
      imagen: p.imagen_url || null,
      stock: 99,
      idcategoria: p.categorias?.[0]?.idcategoria ?? null,
    });
  };

  const addPlansToCart = (products: Producto[]) => {
    products.forEach((p) => addPlanToCart(p));
  };

  return (
    <>
      <JhHeader />
      <main>
        <JhCatalogRubroTabs active={rubro} onChange={setRubro} />
        <p className="border-b border-slate-100 bg-[var(--jh-surface-alt)] px-4 pb-4 text-center text-xs text-[var(--jh-muted)]">
          ¿Solo quieres empezar rápido?{' '}
          <Link href="/comida#ofertas" className="font-bold text-[var(--jh-green-dark)] hover:underline">
            Ir a landing comida →
          </Link>
        </p>

        {rubro === 'comida' && (
          <>
            <JhHero onBuyCombo={() => comboFeria && setBuilderProduct(comboFeria)} />
            <section className="border-b border-slate-100 bg-white px-4 py-8">
              <div className="mx-auto max-w-3xl">
                <JhSistemaDiagram />
              </div>
            </section>
            <JhPlansChecklistSection
              plans={[
                { sku: 'JH-01', product: planBase },
                { sku: 'JH-02', product: bySku.get('JH-02') },
                { sku: 'JH-03', product: bySku.get('JH-03') },
              ]}
              onSelectPlan={(p) => {
                if (p.codigobarra === 'JH-PKG-FERIA' || p.codigobarra === 'JH-CFG-AUTO') {
                  setBuilderProduct(p);
                } else {
                  addPlanToCart(p);
                }
              }}
            />
            <JhPedidosVsCobro />
            <PagarFeriaSection
              planBase={planBase}
              comboFeria={comboFeria}
              onBuyPlan={() => planBase && addPlanToCart(planBase)}
              onBuyCombo={() => comboFeria && setBuilderProduct(comboFeria)}
            />
          </>
        )}

        {rubro === 'retail' && (
          <JhRetailFlyerSection
            planRetail={planRetail}
            addonSoporte={addonSoporte}
            srvMant={srvMant}
            impActivacion={impActivacion}
            impCompleta={impCompleta}
            onBuyRetail={() => planRetail && addPlanToCart(planRetail)}
            onAddRetailPlans={addPlansToCart}
          />
        )}

        {rubro === 'mixto' && <JhOmnicanalHubSection />}

        <JhModularPlansSection />

        <IncluyeTuComprasSection />
        <DosTiposDePagoSection />
        <HardwareModularSection
          onConfigure={() => configurador && setBuilderProduct(configurador)}
        />
        <OfficialPricingSection />
        <HowWeWorkSection />
        <SocialProofSection />
        <AdvancedSection
          configurador={configurador}
          extraCount={extraProducts.length}
          showExtra={showExtra}
          setShowExtra={setShowExtra}
          extraProducts={extraProducts}
          onConfigure={setBuilderProduct}
          loading={loading}
        />
        <FaqSection />
      </main>
      <JhFooter />

      {builderProduct && (
        <ProductBuilderModal
          productId={builderProduct.idproducto}
          onClose={() => setBuilderProduct(null)}
          onAddToCart={(item) => {
            addToCart({
              idproducto: item.idproducto,
              nombre: item.nombre,
              precio_venta: item.precio_venta,
              imagen: item.imagen || null,
              stock: 99,
              pack_includes: item.pack_includes,
              bundle_configuration: item.bundle_configuration,
              idcategoria: item.idcategoria ?? null,
            });
            setBuilderProduct(null);
          }}
        />
      )}
    </>
  );
}
