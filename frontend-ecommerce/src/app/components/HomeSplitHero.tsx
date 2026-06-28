'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Gift, IceCream, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { BRAND_SUBLINE, BRAND_TAGLINE, EXPERIENCE_LABELS, PICKUP_LINE } from '../lib/brandCopy';

type HeroPanelProps = {
  ready: boolean;
  delay?: boolean;
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  badgeIcon: typeof IceCream;
  badge: string;
  title: string;
  description: string;
  stats: { value: string; label: string }[];
  cta: string;
  href: string;
  overlay: string;
  accentText: string;
};

function HeroPanel({
  ready,
  delay,
  imageSrc,
  imageAlt,
  imagePosition = 'object-center',
  badgeIcon: BadgeIcon,
  badge,
  title,
  description,
  stats,
  cta,
  href,
  overlay,
  accentText,
}: HeroPanelProps) {
  const ctaClass = `group/btn relative mt-5 inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-4 py-3.5 text-xs font-bold shadow-xl shadow-black/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl sm:text-sm ${accentText}`;

  return (
    <div className="group/panel relative flex min-h-[320px] flex-col justify-between overflow-hidden sm:min-h-[380px] lg:min-h-[440px]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 33vw"
        className={`object-cover transition-transform duration-[1.4s] ease-out group-hover/panel:scale-105 ${imagePosition}`}
      />
      <div className={`absolute inset-0 ${overlay}`} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
      <div
        className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage: 'url(/images/mesh-grid.svg)',
          backgroundSize: '48px 48px',
        }}
      />

      <div
        className={`relative z-10 flex flex-1 flex-col justify-between p-5 sm:p-6 lg:p-8 ${
          delay ? 'delay-150' : ''
        } transition-all duration-700 ${ready ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
      >
        <div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md sm:text-[10px]">
            <BadgeIcon className="h-3.5 w-3.5 text-brand-accent" />
            {badge}
          </span>
          <h2 className="font-display max-w-[18rem] text-xl font-extrabold leading-[1.12] tracking-tight text-white drop-shadow-md sm:max-w-[20rem] sm:text-2xl lg:text-[1.75rem]">
            {title}
          </h2>
          <p className="mt-2.5 max-w-[19rem] text-sm leading-relaxed text-white sm:text-[0.95rem]">
            {description}
          </p>
        </div>

        <div>
          <div className="mb-1 flex flex-wrap gap-2">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/25 bg-black/45 px-2.5 py-2 backdrop-blur-md sm:px-3"
              >
                <span className="block font-display text-base font-extrabold text-white sm:text-lg">
                  {s.value}
                </span>
                <span className="text-[10px] font-semibold text-white/90 sm:text-[11px]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <Link href={href} className={ctaClass}>
            <span className="relative">{cta}</span>
            <ChevronRight className="relative h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Orden visual: 1 Helado · 2 Regalo · 3 Comida Toppi's */
export default function HomeSplitHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <section className="relative mx-auto max-w-7xl px-3 pb-1 pt-4 sm:px-4 sm:pt-5">
      <div className="home-hero-glow pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl" />
      <div className="home-hero-glow pointer-events-none absolute left-1/3 top-36 h-52 w-52 rounded-full bg-rose-400/10 blur-3xl" />
      <div className="home-hero-glow pointer-events-none absolute -right-20 top-16 h-56 w-56 rounded-full bg-amber-400/12 blur-3xl" />

      <div className="relative mb-5 text-center">
        <p className="premium-kicker mb-2">DondeMorales · {PICKUP_LINE}</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl lg:text-[2rem]">
          {BRAND_TAGLINE}
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-brand-muted">{BRAND_SUBLINE}</p>
      </div>

      <div className="relative overflow-hidden rounded-[1.75rem] bg-white/40 p-1 shadow-premium-lg ring-1 ring-black/[0.04] backdrop-blur-sm md:rounded-[2rem]">
        <div className="grid overflow-hidden rounded-[1.35rem] md:grid-cols-3 md:gap-px md:bg-white/30 md:rounded-[1.65rem]">
          <HeroPanel
            ready={ready}
            imageSrc="/images/hero-toppis.png"
            imageAlt="Helados Toppi's — soft, yogurt y artesanal en DondeMorales"
            imagePosition="object-[70%_center]"
            badgeIcon={IceCream}
            badge={EXPERIENCE_LABELS.helado}
            title="Helado"
            description="Base yogurt, soft o artesanal + tu Toppi's dulce. Combos listos o arma el tuyo."
            stats={[
              { value: '$2.990+', label: 'Combo yogurt' },
              { value: '$1.000', label: 'Helado soft' },
              { value: '$2.800', label: 'Helado yogurt' },
              { value: '$2.000', label: 'Helado artesanal' },
            ]}
            cta="Ver helados"
            href="/helados"
            overlay="bg-gradient-to-br from-[#042f24]/95 via-[#0f4c3a]/88 to-[#134e3a]/40"
            accentText="text-brand-primary"
          />
          <HeroPanel
            ready={ready}
            delay
            imageSrc="/images/hero-regalos.png"
            imageAlt="Canasta regalo DondeMorales"
            imagePosition="object-[60%_center]"
            badgeIcon={Gift}
            badge={EXPERIENCE_LABELS.regalo}
            title="Regalo"
            description={`Pack listo o personalizable. Reserva online · retiro ${PICKUP_LINE}.`}
            stats={[
              { value: '15+', label: 'packs' },
              { value: 'Gratis', label: 'envío Renaico' },
            ]}
            cta="Ver regalos"
            href="/regalos"
            overlay="bg-gradient-to-br from-[#4a0d2e]/95 via-[#831843]/88 to-[#4c1d95]/35"
            accentText="text-rose-800"
          />
          <HeroPanel
            ready={ready}
            delay
            imageSrc="/images/hero-salada.png"
            imageAlt="Comida Toppi's — chorrillana y platos en DondeMorales"
            imagePosition="object-center"
            badgeIcon={UtensilsCrossed}
            badge={EXPERIENCE_LABELS.comida}
            title="Comida"
            description="Chorrillana, completo, wok o plato listo. Elige base y extras — precio claro en cada paso."
            stats={[
              { value: '4', label: 'bases' },
              { value: '+', label: "Toppi's" },
            ]}
            cta="Ver comida Toppi's"
            href="/salada"
            overlay="bg-gradient-to-br from-[#431407]/95 via-[#9a3412]/88 to-[#78350f]/30"
            accentText="text-amber-900"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <Link
          href="#catalogo"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-5 py-2.5 text-xs font-bold text-brand-ink shadow-sm backdrop-blur transition hover:border-brand-primary hover:shadow-md"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-brand-primary" />
          Ver minimarket completo
          <ChevronRight className="h-3.5 w-3.5 text-brand-muted" />
        </Link>
      </div>
    </section>
  );
}
