'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gift, IceCream, MapPin, Package } from 'lucide-react';
import Logo from '../components/Logo';
import CartButton from '../components/CartButton';
import StickyMobileCartBar from '../components/StickyMobileCartBar';
import ExperienceMobileNav from '../components/ExperienceMobileNav';
import PacksReservaSection from '../components/PacksReservaSection';
import PacksPageHero from '../components/PacksPageHero';
import ExperienceSearchResults from '../components/ExperienceSearchResults';

function isStoreOpen(): boolean {
  const hour = new Date().getHours();
  return hour >= 9 && hour < 21;
}

export default function PacksPage() {
  const abierto = isStoreOpen();

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
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-1.5 sm:flex">
              <Link
                href="/packs"
                className="premium-nav-chip border-brand-primary bg-brand-primary text-white shadow-md"
              >
                <Package className="h-3.5 w-3.5" />
                Packs
              </Link>
              <Link
                href="/helados"
                className="premium-nav-chip border-teal-200/80 bg-white text-teal-900 hover:border-teal-400"
              >
                <IceCream className="h-3.5 w-3.5" />
                Helados
              </Link>
              <Link
                href="/regalos"
                className="premium-nav-chip border-rose-200/80 bg-white text-rose-950 hover:border-rose-400"
              >
                <Gift className="h-3.5 w-3.5" />
                Regalos
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

      <ExperienceMobileNav active="packs" />

      <div className="relative mx-auto max-w-7xl px-3 pt-4 sm:px-4 sm:pt-5">
        <div className="home-hero-glow pointer-events-none absolute -left-16 top-4 h-48 w-48 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="home-hero-glow pointer-events-none absolute -right-12 top-24 h-40 w-40 rounded-full bg-rose-400/12 blur-3xl" />
        <div className="home-hero-glow pointer-events-none absolute left-1/3 top-40 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />
        <PacksPageHero />
      </div>

      <main className="home-main-flow">
        <Suspense fallback={null}>
          <ExperienceSearchResults scope="packs" title="Packs encontrados" />
        </Suspense>
        <Suspense fallback={null}>
          <PacksReservaSection />
        </Suspense>
      </main>

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
          <p className="text-sm text-emerald-100/90">Retiro Santiago Watt 205, Renaico · Envío Renaico y alrededores</p>
        </div>
      </footer>

      <StickyMobileCartBar />
    </div>
  );
}
