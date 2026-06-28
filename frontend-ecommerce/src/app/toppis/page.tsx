import type { Metadata } from 'next';
import Link from 'next/link';
import { Flame, IceCream, Sparkles } from 'lucide-react';
import CartButton from '../components/CartButton';
import Logo from '../components/Logo';

export const metadata: Metadata = {
  title: 'Toppi\'s — Helados y salado | DondeMorales Renaico',
  description:
    'Armá tu Toppi\'s dulce o salado en dondemorales.cl. Helados con fruta real, papas, wok y chorrillana. Retiro en Watt 205 o envío local.',
  openGraph: {
    title: '¿Cuál es tu Toppi\'s? | DondeMorales',
    description: 'Personalizá helados y comida salada online en Renaico.',
    locale: 'es_CL',
    type: 'website',
  },
};

const cards = [
  {
    href: '/helados?utm_source=facebook&utm_medium=organic&utm_campaign=toppis_landing',
    title: 'Helados Toppi\'s',
    desc: 'Yogurt, soft o artesanal. Combos desde $2.990.',
    Icon: IceCream,
    tone: 'from-teal-500 to-emerald-700',
  },
  {
    href: '/salada?utm_source=facebook&utm_medium=organic&utm_campaign=toppis_landing',
    title: 'Salado Toppi\'s',
    desc: 'Papas, wok, chorrillana o completo + toppings.',
    Icon: Flame,
    tone: 'from-orange-500 to-red-700',
  },
  {
    href: '/regalos?utm_source=facebook&utm_medium=organic&utm_campaign=toppis_landing',
    title: 'Regalo Toppi\'s',
    desc: 'Pack personalizable con empaque premium.',
    Icon: Sparkles,
    tone: 'from-rose-500 to-pink-700',
  },
];

export default function ToppisLandingPage() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <header className="premium-glass-header border-b border-slate-100">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Logo compact />
          <CartButton />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">
          DondeMorales · Renaico
        </p>
        <h1 className="text-center font-display text-3xl font-extrabold text-brand-ink sm:text-4xl">
          Tú eres top… ¿cuál es tu Toppi&apos;s?
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-center text-brand-muted">
          Elegí helado, salado o regalo. Precio claro en cada paso. Pedí online y retirá en Watt 205 o recibí a domicilio.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className={`bg-gradient-to-br ${card.tone} p-5 text-white`}>
                <card.Icon className="h-8 w-8 opacity-90" />
              </div>
              <div className="p-4">
                <h2 className="font-display text-lg font-bold text-brand-ink">{card.title}</h2>
                <p className="mt-1 text-sm text-brand-muted">{card.desc}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-brand-primary group-hover:underline">
                  Armar ahora →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-5 text-center">
          <p className="text-sm text-brand-ink">
            Primera compra web: cupón{' '}
            <strong className="text-brand-primary">MORALESWEB10</strong> (10% off, mín. $5.000)
          </p>
          <Link
            href="/checkout?coupon=MORALESWEB10&utm_source=facebook&utm_medium=organic&utm_campaign=bienvenida_toppis"
            className="mt-3 inline-flex rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-hover"
          >
            Ir al checkout con cupón
          </Link>
        </div>

        <p className="mt-8 text-center">
          <Link href="/" className="text-sm font-medium text-brand-primary hover:underline">
            Ver minimarket completo
          </Link>
        </p>
      </main>
    </div>
  );
}
