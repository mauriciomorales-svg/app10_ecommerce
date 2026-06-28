'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarCheck, Flame, Gift, IceCream } from 'lucide-react';
import SearchBar from './SearchBar';

const MOSAIC = [
  {
    src: '/images/hero-toppis.png',
    alt: 'Helados Toppi\'s en DondeMorales',
    position: 'object-[center_35%]',
    label: 'Helados',
    href: '#packs-helados',
    Icon: IceCream,
  },
  {
    src: '/images/hero-salada.png',
    alt: 'Comida Toppi\'s — DondeMorales',
    position: 'object-center',
    label: 'Comida',
    href: '#packs-comida',
    Icon: Flame,
  },
  {
    src: '/images/hero-regalos.png',
    alt: 'Canastas y regalos DondeMorales',
    position: 'object-[center_40%]',
    label: 'Regalos',
    href: '#packs-regalos',
    Icon: Gift,
  },
] as const;

export default function PacksPageHero() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[1.75rem] shadow-premium-lg ring-1 ring-black/[0.06]">
      <div className="grid min-h-[240px] grid-cols-3 sm:min-h-[300px]">
        {MOSAIC.map((panel) => (
          <div key={panel.src} className="relative min-h-[120px] border-r border-white/10 last:border-r-0">
            <Image
              src={panel.src}
              alt={panel.alt}
              fill
              priority
              sizes="(max-width: 640px) 33vw, 400px"
              className={`object-cover ${panel.position} scale-105 transition duration-700 group-hover:scale-110`}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-slate-950/70 to-slate-900/35" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-primary/25 via-transparent to-rose-900/30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.45)_100%)]" />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end px-4 pb-6 pt-16 text-center sm:px-8 sm:pb-8">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
          <CalendarCheck className="h-3.5 w-3.5 text-brand-accent" />
          Reserva · Renaico
        </span>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl">
          Reserva tu pack
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
          Helados, comida Toppi&apos;s o canastas regalo — productos reales del minimarket. Pagas online y lo
          preparamos antes de tu retiro en Santiago Watt 205, Renaico.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {MOSAIC.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[11px] font-bold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/20"
            >
              <Icon className="h-3.5 w-3.5 text-brand-accent" />
              {label}
            </Link>
          ))}
        </div>
        <div className="pointer-events-auto relative z-20 mx-auto mt-5 w-full max-w-xl">
          <Suspense fallback={<div className="h-11 animate-pulse rounded-2xl bg-white/20" />}>
            <SearchBar variant="compact" scope="packs" tone="hero" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
