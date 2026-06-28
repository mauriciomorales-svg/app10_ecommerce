'use client';

import { Suspense, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flame, Gift, IceCream, MapPin, Package, Sparkles, Tag, type LucideIcon } from 'lucide-react';
import { PICKUP_LINE } from '../lib/brandCopy';
import Logo from './Logo';
import CartButton from './CartButton';
import SearchBar from './SearchBar';
import StickyMobileCartBar from './StickyMobileCartBar';
import ExperienceMobileNav from './ExperienceMobileNav';

export type ExperienceTheme = 'helados' | 'regalos' | 'salada';

const THEME_META: Record<
  ExperienceTheme,
  {
    badge: string;
    Icon: LucideIcon;
    glowA: string;
    glowB: string;
    navActive: string;
    navHelados: string;
    navRegalos: string;
    navSalada: string;
  }
> = {
  helados: {
    badge: 'Helado Toppi\'s',
    Icon: IceCream,
    glowA: 'bg-teal-400/15',
    glowB: 'bg-amber-400/10',
    navActive: 'border-teal-400 bg-teal-50 text-teal-900 shadow-md',
    navHelados: 'border-teal-400 bg-teal-50 text-teal-900 shadow-md',
    navRegalos: 'border-rose-200/80 bg-white text-rose-950 hover:border-rose-400',
    navSalada: 'border-amber-200/80 bg-white text-orange-950 hover:border-amber-400',
  },
  regalos: {
    badge: 'Regalo Toppi\'s',
    Icon: Gift,
    glowA: 'bg-rose-400/12',
    glowB: 'bg-violet-400/10',
    navActive: 'border-rose-400 bg-rose-50 text-rose-950 shadow-md',
    navHelados: 'border-teal-200/80 bg-white text-teal-900 hover:border-teal-400',
    navRegalos: 'border-rose-400 bg-rose-50 text-rose-950 shadow-md',
    navSalada: 'border-amber-200/80 bg-white text-orange-950 hover:border-amber-400',
  },
  salada: {
    badge: 'Comida Toppi\'s',
    Icon: Flame,
    glowA: 'bg-amber-400/12',
    glowB: 'bg-orange-400/10',
    navActive: 'border-amber-500 bg-amber-50 text-amber-950 shadow-md',
    navHelados: 'border-teal-200/80 bg-white text-teal-900 hover:border-teal-400',
    navRegalos: 'border-rose-200/80 bg-white text-rose-950 hover:border-rose-400',
    navSalada: 'border-amber-500 bg-amber-50 text-amber-950 shadow-md',
  },
};

function isStoreOpen(): boolean {
  const hour = new Date().getHours();
  return hour >= 9 && hour < 21;
}

const HELADOS_HASH_TARGETS = new Set([
  'helados-predisenados',
  'helados-disenados',
  'base-soft',
  'base-yogen',
  'base-artesanal',
]);

const HELADOS_BASE_LINKS = [
  { href: '#base-soft', name: 'Helado soft', price: 'cono $1.000' },
  { href: '#base-yogen', name: 'Helado de yogurt', price: 'con fruta $2.800' },
  { href: '#base-artesanal', name: 'Helado artesanal', price: 'bolas $2.000' },
] as const;

type Props = {
  theme: ExperienceTheme;
  title: string;
  subtitle?: string;
  note?: ReactNode;
  children: ReactNode;
};

export default function ExperiencePageShell({ theme, title, subtitle, note, children }: Props) {
  const meta = THEME_META[theme];
  const BadgeIcon = meta.Icon;
  const abierto = isStoreOpen();
  const [hashTarget, setHashTarget] = useState('');

  useEffect(() => {
    const readHash = () => setHashTarget(window.location.hash.replace(/^#/, ''));
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const heladosDeepLink =
    theme === 'helados' && hashTarget !== '' && HELADOS_HASH_TARGETS.has(hashTarget);
  const heladosJumpToDesigned =
    hashTarget === 'base-soft' ||
    hashTarget === 'base-yogen' ||
    hashTarget === 'base-artesanal' ||
    hashTarget === 'helados-disenados';

  return (
    <div className="home-page-bg min-h-screen pb-24 md:pb-8">
      <div className="premium-topbar py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-emerald-200/90 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Inicio
          </Link>
          <span className="flex items-center gap-1.5 truncate text-[11px] text-emerald-100/95">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
            Santiago Watt 205, Renaico
          </span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${
              abierto
                ? 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/25'
                : 'bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/25'
            }`}
          >
            {abierto ? '● Abierto' : '● Cerrado'}
          </span>
        </div>
      </div>

      <header className="premium-glass-header">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
          <div className="flex items-center gap-3">
            <Logo compact />
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-1.5 lg:flex">
              <Link
                href="/packs"
                className="premium-nav-chip border-brand-primary/30 bg-white text-brand-primary hover:border-brand-primary hover:bg-emerald-50"
              >
                <Package className="h-3.5 w-3.5" />
                Packs
              </Link>
              <Link
                href="/helados"
                className={`premium-nav-chip ${theme === 'helados' ? meta.navActive : meta.navHelados}`}
              >
                <IceCream className="h-3.5 w-3.5" />
                Helados
              </Link>
              <Link
                href="/regalos"
                className={`premium-nav-chip ${theme === 'regalos' ? meta.navActive : meta.navRegalos}`}
              >
                <Gift className="h-3.5 w-3.5" />
                Regalos
              </Link>
              <Link
                href="/salada"
                className={`premium-nav-chip ${theme === 'salada' ? meta.navActive : meta.navSalada}`}
              >
                <Flame className="h-3.5 w-3.5" />
                Comida
              </Link>
              <Link
                href="/?orden=precio_menor#catalogo"
                className="premium-nav-chip border-amber-300/50 bg-gradient-to-b from-white to-amber-50/60 text-brand-ink shadow-sm hover:border-brand-accent"
              >
                <Tag className="h-3.5 w-3.5 text-brand-accent" />
                Ofertas
              </Link>
            </div>
            <div className="ml-auto shrink-0">
              <Suspense>
                <CartButton />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      <ExperienceMobileNav
        active={
          theme === 'helados' ? 'helados' : theme === 'regalos' ? 'regalos' : theme === 'salada' ? 'salada' : null
        }
      />

      <div className="relative mx-auto max-w-7xl px-3 pt-4 sm:px-4 sm:pt-5">
        <div
          className={`home-hero-glow pointer-events-none absolute -left-16 top-4 h-48 w-48 rounded-full blur-3xl ${meta.glowA}`}
        />
        <div
          className={`home-hero-glow pointer-events-none absolute -right-12 top-20 h-40 w-40 rounded-full blur-3xl ${meta.glowB}`}
        />

        <div
          className={`premium-experience-hero premium-experience-hero--${theme} relative mb-6 ${
            heladosDeepLink ? 'py-5 sm:py-6' : ''
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5" />
          <div className="relative z-10">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              <BadgeIcon className="h-3.5 w-3.5 text-brand-accent" />
              {meta.badge} · {PICKUP_LINE}
            </span>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
            {theme === 'helados' ? (
              heladosDeepLink ? (
                <div className="mx-auto mt-3 max-w-lg text-center">
                  <p className="text-sm text-white/80">
                    {heladosJumpToDesigned
                      ? 'Te llevamos directo a la base que elegiste — usa el menú de abajo para cambiar.'
                      : 'Te llevamos al combo listo — desliza el menú si quieres otra opción.'}
                  </p>
                  {heladosJumpToDesigned && (
                    <a
                      href={`#${hashTarget}`}
                      className="mt-3 inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-400/15 px-4 py-2 text-xs font-bold text-amber-100 hover:bg-amber-400/25"
                    >
                      Ir a{' '}
                      {HELADOS_BASE_LINKS.find((item) => item.href === `#${hashTarget}`)?.name.toLowerCase() ??
                        'tu base'}
                      <ArrowLeft className="h-3.5 w-3.5 rotate-[-90deg]" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="mx-auto mt-5 max-w-lg space-y-3 text-left">
                  <p className="text-center text-sm font-medium text-white/75">
                    Dos caminos · elige uno y sigue
                  </p>
                  <a
                    href="#helados-predisenados"
                    className="group relative flex gap-3 rounded-[1.25rem] border border-fuchsia-400/35 bg-gradient-to-br from-fuchsia-950 via-[#2a1020] to-[#0f172a] px-4 py-4 shadow-premium-lg shadow-fuchsia-900/25 transition duration-300 hover:-translate-y-0.5 hover:border-fuchsia-300/50 hover:shadow-glow-rose"
                  >
                    <span className="absolute -top-2.5 right-3 rounded-full bg-toppis-mustard px-2.5 py-0.5 text-[10px] font-black uppercase text-brand-ink shadow-sm">
                      Lo más pedido
                    </span>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/90 text-xl shadow-lg shadow-fuchsia-900/30">
                      🍦
                    </span>
                    <span className="min-w-0 flex-1 text-sm leading-snug text-white/90">
                      <strong className="block font-display text-lg text-white">Combo de helado de yogurt</strong>
                      <span className="mt-0.5 block">Listo para pedir — fruta y salsa incluidas.</span>
                      <span className="mt-1.5 block font-display text-2xl font-extrabold tabular-nums text-fuchsia-200">
                        $2.990
                      </span>
                      <span className="block text-[10px] font-medium text-white/60">
                        precio fijo · sin extras ocultos
                      </span>
                    </span>
                  </a>
                  <div className="rounded-[1.25rem] border border-slate-200/90 bg-white/95 px-4 py-3.5 shadow-premium">
                    <p className="text-sm font-bold text-brand-ink">O arma tu helado</p>
                    <div className="mt-2 grid gap-1.5">
                      {HELADOS_BASE_LINKS.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          className="rounded-xl border border-slate-200/90 bg-slate-50 px-3 py-2 text-sm text-brand-ink transition hover:border-amber-300 hover:bg-amber-50/80"
                        >
                          <strong>{item.name}</strong>
                          <span className="text-brand-muted"> · {item.price}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <>
                {subtitle && (
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                    {subtitle}
                  </p>
                )}
                {note && (
                  <div className="mx-auto mt-3 flex max-w-xl items-center justify-center gap-1.5 text-xs text-white/80">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
                    {note}
                  </div>
                )}
              </>
            )}
            <div className="relative z-10 mx-auto mt-4 max-w-xl">
              <Suspense fallback={<div className="h-10 animate-pulse rounded-xl bg-white/20" />}>
                <SearchBar variant="compact" scope={theme} tone="hero" />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <main className="home-main-flow">{children}</main>

      <footer className="premium-footer mt-4">
        <div className="relative z-10">
          <Link href="/" className="mb-3 inline-flex items-center justify-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-accent/90 font-display text-sm font-extrabold text-brand-ink shadow-lg shadow-black/20">
              DM
            </span>
            <span className="font-display text-base font-extrabold tracking-tight text-white">
              Donde<span className="text-brand-accent">Morales</span>
            </span>
          </Link>
          <p className="text-sm text-emerald-100/90">
            Retiro en tienda (Santiago Watt 205, Renaico) · Envío con costo al pagar
          </p>
          <p className="mt-2 flex flex-wrap justify-center gap-3 text-[11px]">
            <Link href="/envios" className="font-semibold text-emerald-200/90 hover:text-white">
              Envíos y FAQ
            </Link>
            <a
              href="https://wa.me/56975647756"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-200/90 hover:text-white"
            >
              WhatsApp
            </a>
          </p>
          <p className="mt-1 text-[11px] text-emerald-200/50">Araucanía, Chile</p>
        </div>
      </footer>

      <StickyMobileCartBar />
    </div>
  );
}
