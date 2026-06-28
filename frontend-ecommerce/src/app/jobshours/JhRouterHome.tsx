'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MessageCircle, ScanLine, Sparkles, UtensilsCrossed } from 'lucide-react';
import { Suspense } from 'react';
import CartButton from '../components/CartButton';
import { useCommerceStore } from '../context/CommerceStoreContext';
import { formatCLP } from '../lib/money';
import { HOME_AMBIENT, HOME_GALLERY, L, MARCA, PRECIOS, FLYERS, WA_LINK, WHATSAPP_DISPLAY } from './jh-data';
import { JhModularPlansSection } from './JhModularPlansSection';
import { JhSistemaDiagram } from './JhSistemaDiagram';

function FlyerFrame({
  src,
  alt,
  caption,
  className = '',
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  return (
    <figure className={`overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm ${className}`}>
      <div className="flex aspect-video items-center justify-center p-2 sm:p-3">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={675}
          className="max-h-full max-w-full object-contain"
          unoptimized={src.startsWith('http')}
        />
      </div>
      {caption && (
        <figcaption className="border-t border-slate-200 bg-white px-3 py-2.5 text-center text-xs font-bold text-[var(--jh-ink)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function JhRouterHeader() {
  const { store } = useCommerceStore();
  return (
    <header className="absolute left-0 right-0 top-0 z-20 border-b border-white/15 bg-gradient-to-b from-black/70 to-black/20 px-4 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 shadow-md backdrop-blur">
            <span className="font-display text-sm font-extrabold text-[var(--jh-green-dark)]">JH</span>
          </div>
          <div>
            <span className="font-display text-lg font-bold text-white drop-shadow-sm">
              {store?.brand?.title ?? 'JobsHours'}
            </span>
            <p className="text-[11px] font-semibold text-white drop-shadow-md">{MARCA.madre}</p>
          </div>
        </div>
        <Suspense>
          <div className="[&_button]:border-white/30 [&_button]:bg-white/90">
            <CartButton />
          </div>
        </Suspense>
      </div>
    </header>
  );
}

type DoorCardProps = {
  href: string;
  ambient: string;
  icon: typeof UtensilsCrossed;
  title: string;
  line: string;
  price: string;
  cta: string;
  badge: string;
  accentClass: string;
};

function DoorCard({ href, ambient, icon: Icon, title, line, price, cta, badge, accentClass }: DoorCardProps) {
  return (
    <Link
      href={href}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-[var(--jh-shadow)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(26,26,26,0.12)] ${accentClass}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={ambient}
          alt=""
          width={640}
          height={400}
          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
          unoptimized={ambient.startsWith('http')}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--jh-ink)] shadow">
          <Sparkles className="h-3 w-3 text-[var(--jh-orange)]" />
          {badge}
        </span>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
          <Icon className="h-9 w-9 text-white drop-shadow-md" strokeWidth={2} />
          <span className="rounded-full bg-[var(--jh-orange)] px-3 py-1 text-xs font-bold text-white shadow-lg">
            {price}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-xl font-extrabold text-[var(--jh-ink)]">{title}</h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--jh-muted-strong)]">{line}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[var(--jh-green-dark)] group-hover:gap-2 transition-all">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export default function JhRouterHome() {
  const doors: DoorCardProps[] = [
    {
      href: '/comida',
      ambient: HOME_AMBIENT.comida,
      icon: UtensilsCrossed,
      title: 'Comida con fila',
      line: 'Tablet de pedidos + Mercado Pago. El cliente pide y paga; tú cocinas sin fila en caja.',
      price: `${L.packAndando} ${formatCLP(PRECIOS.comboAndando)}`,
      badge: 'Restaurantes · feria',
      accentClass: 'hover:border-[var(--jh-green)]',
      cta: 'Comprar instalación',
    },
    {
      href: '/minimarket',
      ambient: FLYERS.retail,
      icon: ScanLine,
      title: 'Minimarket y almacén',
      line: 'Caja, inventario y lector de barras. Pensado para góndola, no para fila de comida.',
      price: `desde ${formatCLP(PRECIOS.planRetail)}/mes`,
      badge: 'Retail · barrio',
      accentClass: 'hover:border-[var(--jh-blue)]',
      cta: 'Ver solución caja',
    },
  ];

  return (
    <>
      <JhRouterHeader />

      {/* HERO con foto */}
      <section className="relative min-h-[52vh] overflow-hidden md:min-h-[58vh]">
        <Image
          src={HOME_AMBIENT.hero}
          alt="Local de comida con atención en mostrador"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#0f172a]/88 to-[#0f172a]/55" />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-end px-4 pb-12 pt-28 md:min-h-[58vh] md:pb-16 md:pt-32">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Araucanía · instalación en tu local
          </p>
          <h1 className="jh-hero-text mt-4 max-w-2xl font-display text-3xl font-extrabold leading-[1.08] text-white md:text-5xl">
            {MARCA.headline}
            <span className="mt-1 block text-emerald-300">{MARCA.subhead}</span>
          </h1>
          <p className="jh-hero-text mt-4 max-w-xl text-base font-medium text-white md:text-lg">
            Elige tu tipo de negocio. Cada solución tiene precios claros y fotos reales del sistema — sin mezclar
            comida con góndola en la misma página.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/comida#ofertas" className="jh-btn-primary">
              Comprar instalación · {formatCLP(PRECIOS.comboAndando)}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="jh-btn-secondary !border-white/30 !bg-white/95">
              <MessageCircle className="h-4 w-4" />
              ¿Dudas? WhatsApp
            </a>
          </div>
        </div>
      </section>

      <main className="bg-[var(--jh-surface-alt)]">
        {/* Puertas con foto */}
        <section className="px-4 py-14 md:py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="jh-section-title text-center">¿Qué tipo de local tienes?</h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-sm font-medium text-[var(--jh-muted-strong)]">
              Dos caminos distintos. Entra solo al que te corresponde.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">{doors.map((d) => <DoorCard key={d.href} {...d} />)}</div>
            <p className="mx-auto mt-8 max-w-lg text-center text-xs font-medium text-[var(--jh-muted)]">
              ¿Bot WhatsApp, POS y tienda web con el mismo catálogo?{' '}
              <Link href="/catalogo#modular" className="font-bold text-violet-700 hover:underline">
                Ver planes modulares →
              </Link>
            </p>
          </div>
        </section>

        <JhModularPlansSection variant="teaser" />

        {/* Galería producto */}
        <section className="border-t border-slate-200/80 bg-white px-4 py-14">
          <div className="mx-auto max-w-6xl">
            <h2 className="jh-section-title text-center">Así se ve JobsHours en tu negocio</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm font-medium text-[var(--jh-muted-strong)]">
              Capturas del sistema: pedidos en tablet, cobros con Mercado Pago e instalación en local.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {HOME_GALLERY.map(({ src, alt, caption }) => (
                <FlyerFrame key={src} src={src} alt={alt} caption={caption} />
              ))}
            </div>
          </div>
        </section>

        {/* Oferta rápida */}
        <section className="px-4 py-12">
          <div className="mx-auto grid max-w-6xl items-stretch gap-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[var(--jh-shadow)] md:grid-cols-2">
            <div className="flex flex-col justify-center border-b border-slate-100 bg-white p-6 md:border-b-0 md:border-r md:p-10">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--jh-green-dark)]">Para hacer caja hoy</p>
              <h3 className="mt-2 font-display text-2xl font-extrabold text-[var(--jh-ink)] md:text-3xl">
                Te lo dejamos andando
              </h3>
              <p className="mt-4 text-base font-bold text-[var(--jh-ink)]">
                Instalación + primer mes · {formatCLP(PRECIOS.comboAndando)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--jh-muted-strong)]">
                ¿Tienes <strong className="text-[var(--jh-ink)]">PC o tablet</strong> en el local? La adaptamos para
                pedidos en pantalla. Nosotros: Mercado Pago, menú cargado y enseñanza ~30 min.
              </p>
              <p className="mt-2 text-xs font-medium text-[var(--jh-muted)]">
                Si aún no tienes equipo, te decimos qué comprar (sin sorpresas en el precio del servicio).
              </p>
              <Link href="/comida#ofertas" className="jh-btn-primary mt-6 inline-flex w-fit">
                Comprar instalación + mes 1
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex min-h-[240px] flex-col justify-center bg-[var(--jh-green-soft)] p-4 md:min-h-[280px] md:p-8">
              <JhSistemaDiagram compact />
              <p className="mt-4 text-center text-sm font-bold text-[var(--jh-green-dark)]">
                Instalación en tu local · ~7 días hábiles
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 px-4 py-8 text-center text-xs text-[var(--jh-muted)]">
          <Link href="/catalogo" className="font-bold text-[var(--jh-green-dark)] hover:underline">
            Catálogo completo
          </Link>
          {' · '}
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--jh-green-dark)] hover:underline">
            WhatsApp {WHATSAPP_DISPLAY}
          </a>
          <p className="mt-2">Lun–Sáb 09:00–21:00 · {MARCA.madre}</p>
        </footer>
      </main>
    </>
  );
}
