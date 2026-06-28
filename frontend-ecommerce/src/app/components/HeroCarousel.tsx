'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Store, Truck, ShoppingBag, IceCream, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 'toppis',
    icon: IceCream,
    title: 'Toppi\'s — arma tu helado o chorrillana',
    subtitle: 'Helado de yogurt, soft o artesanal. Combos listos desde $2.990. También packs y regalos.',
    cta: 'Ver Toppi\'s',
    href: '#experiencia-toppis',
    gradient: 'from-cyan-600 via-teal-600 to-emerald-800',
  },
  {
    id: 'pickup',
    icon: Store,
    title: 'Tu minimarket en Renaico, a un clic',
    subtitle: 'Paga online y retira hoy en Santiago Watt 205 con tu código.',
    cta: 'Ver catálogo',
    href: '#catalogo',
    gradient: 'from-brand-primary via-brand-primary-light to-[#0d5c44]',
  },
  {
    id: 'delivery',
    icon: Truck,
    title: 'Envío a domicilio con repartidor local',
    subtitle: 'Calcula el envío al pagar. Seguimiento en tiempo real.',
    cta: 'Comprar ahora',
    href: '#catalogo',
    gradient: 'from-[#0a3d2e] via-brand-primary to-[#134e3a]',
  },
  {
    id: 'gifts',
    icon: ShoppingBag,
    title: 'Regalos y packs personalizados',
    subtitle: 'Pack Desayuno, Canasta y Once — siempre personalizables paso a paso. Caja regalo en checkout.',
    cta: 'Ver regalos',
    href: '/regalos',
    gradient: 'from-rose-600 via-pink-700 to-violet-900',
  },
  {
    id: 'catalog',
    icon: ShoppingBag,
    title: 'Minimarket completo',
    subtitle: 'Snacks, bebidas, abarrotes y más de 1.900 productos.',
    cta: 'Ver catálogo',
    href: '#catalogo',
    gradient: 'from-brand-primary via-[#14532d] to-brand-primary-hover',
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[index];
  const Icon = slide.icon;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 pb-1">
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${slide.gradient} text-white shadow-card-hover min-h-[168px] sm:min-h-[200px]`}
      >
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div key={slide.id} className="relative px-5 py-6 sm:px-8 sm:py-8 animate-hero-slide">
          <div className="flex items-start gap-4 max-w-xl">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/15 backdrop-blur items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-brand-accent" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-200/90 mb-1">
                DondeMorales.cl
              </p>
              <h2 className="font-display font-bold text-xl sm:text-2xl leading-tight mb-2">
                {slide.title}
              </h2>
              <p className="text-sm text-emerald-50/90 leading-snug mb-4 max-w-md">{slide.subtitle}</p>
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-brand-ink font-bold text-sm rounded-xl transition-colors shadow-lg"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute bottom-3 left-5 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-brand-accent' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
