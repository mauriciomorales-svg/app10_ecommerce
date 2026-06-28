'use client';

import { Gift, IceCream, ShoppingCart } from 'lucide-react';

const STEPS = [
  {
    icon: IceCream,
    step: '01',
    title: 'Elige pack o plato',
    text: 'Helados, regalo, combo cocina o salado — precio claro antes de pagar.',
    gradient: 'from-cyan-500/10 via-teal-500/5 to-transparent',
    ring: 'ring-cyan-200/50',
    iconBg: 'bg-gradient-to-br from-cyan-400 to-teal-600 text-white shadow-glow',
  },
  {
    icon: ShoppingCart,
    step: '02',
    title: 'Retiro o envío Renaico',
    text: 'Retiro gratis en Watt 205 o delivery con ventana confirmada (packs desde $12.000 recomendado).',
    gradient: 'from-emerald-500/10 via-brand-primary/5 to-transparent',
    ring: 'ring-emerald-200/50',
    iconBg: 'bg-gradient-to-br from-brand-primary to-emerald-700 text-white',
  },
  {
    icon: Gift,
    step: '03',
    title: 'Pagas y lo preparamos',
    text: 'Pago seguro online. Cocina y packs se arman antes de tu fecha — te avisamos por WhatsApp.',
    gradient: 'from-rose-500/10 via-fuchsia-500/5 to-transparent',
    ring: 'ring-rose-200/50',
    iconBg: 'bg-gradient-to-br from-rose-500 to-violet-700 text-white shadow-glow-rose',
  },
];

export default function HomeHowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="premium-section-head mb-6">
        <span className="premium-kicker">En 3 pasos</span>
        <h2 className="premium-heading">Así de fácil comprar en DondeMorales</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.title}
            className={`glass-panel group relative overflow-hidden rounded-[1.35rem] p-5 ring-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg ${step.ring}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient}`} />
            <span className="relative font-display text-4xl font-extrabold text-brand-primary/10 transition-colors group-hover:text-brand-primary/15">
              {step.step}
            </span>
            <div
              className={`relative -mt-6 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${step.iconBg}`}
            >
              <step.icon className="h-6 w-6" strokeWidth={2} />
            </div>
            <h3 className="relative font-bold text-brand-ink">{step.title}</h3>
            <p className="relative mt-1.5 text-sm leading-relaxed text-brand-muted">{step.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
