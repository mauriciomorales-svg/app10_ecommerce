'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import {
  Banknote,
  ChevronDown,
  ClipboardCheck,
  MessageCircle,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import CartButton from '../components/CartButton';
import ProductBuilderModal from '../components/ProductBuilderModal';
import { useCart } from '../context/CartContext';
import { useCommerceStore } from '../context/CommerceStoreContext';
import { formatCLP } from '../lib/money';
import { JhPedidosVsCobro } from './JhPedidosVsCobro';
import { JhPlansChecklistSection } from './JhPlansChecklistSection';
import { JhSistemaDiagram } from './JhSistemaDiagram';
import { JhSocialProofStrip, JhTestimonialBlock } from './JhSocialProof';
import { JhStickyCta } from './JhStickyCta';
import {
  FLYERS,
  L,
  MARCA,
  PACK_EXPRESS_APARTE,
  PACK_EXPRESS_INCLUYE,
  PACK_EXPRESS_STOCK_DISPONIBLE,
  PACK_SKUS,
  PRECIOS,
  WA_LINK,
  WA_PACK_ANDANDO,
  WA_PACK_EXPRESS,
} from './jh-data';
import { setJhPurchaseIntent } from './jh-purchase-intent';
import { useJobshoursProducts, type JobshoursProducto } from './useJobshoursProducts';

const STEPS = [
  { n: '1', title: 'El cliente pide', sub: 'En la tablet, sin fila en caja' },
  { n: '2', title: 'Paga al instante', sub: 'Tarjeta o Mercado Pago' },
  { n: '3', title: 'Tú cocinas', sub: 'Pedido claro en pantalla o impresora' },
] as const;

function ComidaHeader() {
  const { store } = useCommerceStore();
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-display text-sm font-bold text-[var(--jh-muted)] hover:text-[var(--jh-green-dark)]">
          ← JobsHours
        </Link>
        <span className="hidden text-sm font-semibold text-[var(--jh-ink)] md:inline">
          {store?.brand?.title ?? 'Comida con fila'}
        </span>
        <Suspense>
          <CartButton />
        </Suspense>
      </div>
    </header>
  );
}

export default function JhComidaLanding() {
  const { addToCart } = useCart();
  const { bySku } = useJobshoursProducts();
  const [builderProduct, setBuilderProduct] = useState<JobshoursProducto | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const planBase = bySku.get('JH-01');
  const planIA = bySku.get('JH-02');
  const planOmni = bySku.get('JH-03');
  const comboAndando = bySku.get('JH-PKG-FERIA');
  const packExpress = bySku.get(PACK_SKUS.express);
  const canPayExpressOnline = PACK_EXPRESS_STOCK_DISPONIBLE > 0 && Boolean(packExpress);

  const openBuilder = (product: JobshoursProducto, sku: string) => {
    setJhPurchaseIntent(sku, product.nombre);
    setBuilderProduct(product);
  };

  const buyAndando = () => {
    if (comboAndando) {
      openBuilder(comboAndando, PACK_SKUS.andando);
    } else {
      document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const addPlanToCart = (p: JobshoursProducto) => {
    addToCart({
      idproducto: p.idproducto,
      nombre: p.nombre,
      precio_venta: p.precio_venta ?? PRECIOS.planMinimo,
      imagen: p.imagen_url || null,
      stock: 99,
      idcategoria: p.categorias?.[0]?.idcategoria ?? null,
    });
  };

  const onSelectPlan = (p: JobshoursProducto) => {
    const sku = p.codigobarra ?? '';
    if (sku === PACK_SKUS.andando || sku === 'JH-CFG-AUTO') {
      openBuilder(p, sku);
      return;
    }
    addPlanToCart(p);
  };

  const faqs = [
    {
      q: '¿Necesito boleta electrónica al SII?',
      a: 'El pack base deja listo Mercado Pago para cobrar. Si necesitas boleta legal con contador, lo cotizamos aparte.',
    },
    {
      q: '¿Qué pasa si se cae el internet?',
      a: 'Recomendamos Wi‑Fi estable. Si falla, puedes seguir tomando pedidos manualmente hasta que vuelva.',
    },
    {
      q: '¿Pueden robarse la tablet?',
      a: 'Usamos soporte fijo en mesón. La tablet queda visible; muchos locales la atan con cable de seguridad.',
    },
    {
      q: '¿Cuál pack me conviene?',
      a: `«${L.packAndando}» (${formatCLP(PRECIOS.comboAndando)}): tú traes PC o tablet y nosotros instalamos. Pack Express (${formatCLP(PRECIOS.packExpress)}): traemos tablet configurada cuando hay stock. Solo programa: ${formatCLP(PRECIOS.planMinimo)}/mes si ya sabes configurar.`,
    },
    {
      q: '¿Incluye la maquinita Mercado Pago?',
      a: `No en el precio del servicio base: incluye tablet de pedidos y programa. La maquinita (Point) es para cobrar tarjeta en caja; si ya la tienes, la enlazamos. Si no, la compras en Mercado Pago o JobsHours puede entregártela con precio aparte acordado por WhatsApp antes de pagar.`,
    },
  ];

  return (
    <>
      <ComidaHeader />
      <main className="pb-24 md:pb-8">
        {/* HERO */}
        <section className="bg-[var(--jh-surface-alt)] px-4 py-10 md:py-14">
          <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--jh-green-dark)]">
                Para restaurantes · fuentes · cafés · puestos en feria
              </p>
              <h1 className="mt-2 font-display text-3xl font-extrabold leading-[1.1] text-[var(--jh-ink)] sm:text-4xl">
                {MARCA.headline}
                <br />
                <span className="text-[var(--jh-green-dark)]">{MARCA.subhead}</span>
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-base text-[var(--jh-muted)] lg:mx-0">{MARCA.explainer}</p>
              <div className="mx-auto mt-6 max-w-lg lg:mx-0">
                <JhSistemaDiagram compact />
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <button type="button" onClick={buyAndando} className="jh-btn-primary">
                  <ShoppingCart className="h-4 w-4" />
                  Comprar instalación · {formatCLP(PRECIOS.comboAndando)}
                </button>
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="jh-btn-secondary">
                  <MessageCircle className="h-4 w-4" />
                  ¿Dudas? WhatsApp 2 min
                </a>
              </div>
            </div>
            <div className="jh-dashed-frame overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg">
              <Image
                src={FLYERS.kiosko}
                alt="Tablet de pedidos JobsHours en mostrador"
                width={800}
                height={1000}
                className="h-auto w-full rounded-xl"
                priority
              />
            </div>
          </div>
        </section>

        <JhSocialProofStrip />

        {/* CÓMO FUNCIONA */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="jh-section-title text-center">Cómo funciona (3 pasos)</h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {STEPS.map(({ n, title, sub }) => (
                <li key={n} className="jh-card text-center">
                  <span className="font-display text-2xl font-extrabold text-[var(--jh-orange)]">{n}</span>
                  <p className="mt-2 font-bold text-[var(--jh-ink)]">{title}</p>
                  <p className="mt-1 text-xs text-[var(--jh-muted)]">{sub}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-white px-2 py-4">
              {[
                { title: 'Sin efectivo', sub: 'Menos caja', icon: Banknote },
                { title: 'Sin errores', sub: 'Pedido claro', icon: ClipboardCheck },
                { title: 'Más higiene', sub: 'Tú en cocina', icon: Sparkles },
              ].map(({ title, sub, icon: Icon }) => (
                <div key={title} className="text-center">
                  <Icon className="mx-auto h-6 w-6 text-[var(--jh-green-dark)]" />
                  <p className="mt-1 text-xs font-bold">{title}</p>
                  <p className="text-[10px] text-[var(--jh-muted)]">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <JhPedidosVsCobro showPackExpressApart={canPayExpressOnline} />

        {/* OFERTA: ANDANDO primero · Express consulta */}
        <section id="ofertas" className="scroll-mt-20 bg-[var(--jh-green-soft)] px-4 py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="jh-section-title text-center">Elige cómo quieres empezar</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-[var(--jh-muted)]">
              Recomendado si ya tienes <strong className="text-[var(--jh-ink)]">PC o tablet</strong>: instalación +
              primer mes.{' '}
              <a href="#planes" className="font-bold text-[var(--jh-green-dark)] hover:underline">
                Comparar planes mensuales ↓
              </a>
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <article className="jh-card flex flex-col border-2 border-[var(--jh-green)] ring-2 ring-[var(--jh-green)]/20">
                <span className="text-xs font-bold uppercase text-[var(--jh-green-dark)]">Recomendado · hoy</span>
                <h3 className="mt-2 font-display text-2xl font-extrabold">{L.packAndando}</h3>
                <p className="mt-1 font-display text-3xl font-extrabold text-[var(--jh-ink)]">
                  {formatCLP(PRECIOS.comboAndando)}
                </p>
                <p className="text-xs font-semibold text-[var(--jh-muted)]">
                  Instalación {formatCLP(PRECIOS.implAndando)} + primer mes {formatCLP(PRECIOS.planMinimo)} · un solo
                  pago
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--jh-muted-strong)]">
                  Adaptamos tu <strong className="text-[var(--jh-ink)]">PC o tablet</strong>. Nosotros: Mercado Pago,
                  menú, visita y enseñanza ~30 min. Maquinita aparte si la necesitas.
                </p>
                <p className="mt-2 text-sm">
                  <strong>Solo programa:</strong> {formatCLP(PRECIOS.planMinimo)}/mes — sin instalación incluida.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  {comboAndando && (
                    <button
                      type="button"
                      onClick={() => openBuilder(comboAndando, PACK_SKUS.andando)}
                      className="jh-btn-primary text-center"
                    >
                      <ShoppingCart className="inline h-4 w-4" />
                      Comprar instalación + mes 1
                    </button>
                  )}
                  <a href={WA_PACK_ANDANDO} target="_blank" rel="noopener noreferrer" className="jh-btn-secondary text-center text-sm">
                    <MessageCircle className="inline h-4 w-4" />
                    Consultar antes de pagar
                  </a>
                  {planBase && (
                    <button
                      type="button"
                      onClick={() => addPlanToCart(planBase)}
                      className="text-center text-xs font-bold text-[var(--jh-green-dark)] hover:underline"
                    >
                      Solo primer mes · {formatCLP(PRECIOS.planMinimo)}
                    </button>
                  )}
                </div>
              </article>

              <article className="jh-card flex flex-col opacity-95">
                <span className="text-xs font-bold uppercase text-[var(--jh-muted)]">Llave en mano · consulta stock</span>
                <h3 className="mt-2 font-display text-xl font-bold">Pack JobsHours Express</h3>
                <p className="mt-1 font-display text-2xl font-extrabold">{formatCLP(PRECIOS.packExpress)}</p>
                <p className="text-xs text-[var(--jh-muted)]">
                  Tablet de pedidos + instalación + mes 1 · maquinita aparte
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {PACK_EXPRESS_INCLUYE.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-[var(--jh-green-dark)]">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-[var(--jh-muted)]">
                  {PACK_EXPRESS_APARTE.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-[var(--jh-orange)]">○</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  {canPayExpressOnline ? (
                    <button
                      type="button"
                      onClick={() => openBuilder(packExpress!, PACK_SKUS.express)}
                      className="jh-btn-secondary text-sm"
                    >
                      Comprar Pack Express
                    </button>
                  ) : (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-[var(--jh-muted)]">
                      Sin tablets listas para despacho online · reserva por WhatsApp
                    </p>
                  )}
                  <a href={WA_PACK_EXPRESS} target="_blank" rel="noopener noreferrer" className="jh-btn-secondary text-center text-sm">
                    Reservar Pack Express · WhatsApp
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <JhPlansChecklistSection
          linkMode="comida"
          plans={[
            { sku: 'JH-01', product: planBase },
            { sku: 'JH-02', product: planIA },
            { sku: 'JH-03', product: planOmni },
          ]}
          onSelectPlan={onSelectPlan}
        />

        <JhTestimonialBlock />

        {/* FAQ */}
        <section id="faq" className="bg-[var(--jh-surface-alt)] px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <h2 className="jh-section-title text-center">Preguntas antes de comprar</h2>
            <div className="mt-6 space-y-2">
              {faqs.map((item, i) => (
                <div key={item.q} className="jh-card overflow-hidden p-0">
                  <button
                    type="button"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold"
                  >
                    {item.q}
                    <ChevronDown className={`h-4 w-4 ${faqOpen === i ? 'rotate-180' : ''}`} />
                  </button>
                  {faqOpen === i && (
                    <p className="border-t border-slate-100 px-4 pb-3 pt-2 text-sm text-[var(--jh-muted)]">{item.a}</p>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-[var(--jh-muted)]">
              <a href="#planes" className="font-bold text-[var(--jh-green-dark)] hover:underline">
                Comparar planes mensuales ↑
              </a>
              {' · '}
              <Link href="/catalogo" className="font-bold text-[var(--jh-green-dark)] hover:underline">
                Catálogo completo →
              </Link>
            </p>
          </div>
        </section>

        {/* CTA desktop */}
        <section className="hidden px-4 py-10 md:block">
          <div className="mx-auto max-w-xl text-center">
            <button type="button" onClick={buyAndando} className="jh-btn-primary inline-flex text-lg">
              <ShoppingCart className="h-5 w-5" />
              Comprar {L.packAndando} · {formatCLP(PRECIOS.comboAndando)}
            </button>
            <p className="mt-3 text-xs text-[var(--jh-muted)]">
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--jh-green-dark)] hover:underline">
                ¿Prefieres hablar primero? WhatsApp
              </a>
            </p>
          </div>
        </section>
      </main>

      <JhStickyCta
        primary={{
          kind: 'button',
          onClick: buyAndando,
          label: `Comprar · ${formatCLP(PRECIOS.comboAndando)}`,
          icon: 'cart',
        }}
        sub="Instalación + primer mes · Lun–Sáb 09–21 h"
        secondary={{ href: WA_LINK, label: '¿Dudas? WhatsApp' }}
      />

      {builderProduct && (
        <ProductBuilderModal
          productId={builderProduct.idproducto}
          onClose={() => setBuilderProduct(null)}
          onAddToCart={(item) => {
            const sku = builderProduct?.codigobarra;
            if (sku === PACK_SKUS.express || sku === PACK_SKUS.andando) {
              setJhPurchaseIntent(sku, item.nombre);
            }
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
