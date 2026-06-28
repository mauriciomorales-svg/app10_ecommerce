'use client';

import { Gift, Package, Sparkles, Truck } from 'lucide-react';
import { useCheckoutThresholds } from '../hooks/useCheckoutThresholds';

function fmt(n: number) {
  return n.toLocaleString('es-CL');
}

export default function HomePromoBar() {
  const { thresholds } = useCheckoutThresholds(0);

  return (
    <section className="relative mx-auto max-w-7xl px-3 py-3 sm:px-4">
      <div className="section-shine relative overflow-hidden rounded-[1.65rem] border border-emerald-900/20 shadow-premium-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a3328] via-brand-primary to-emerald-900" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-accent/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-5 px-4 py-5 sm:px-7 sm:py-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-md text-white">
            <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200/90">
              <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
              Compra inteligente
            </p>
            <h2 className="font-display text-xl font-extrabold leading-tight sm:text-2xl">
              Suma productos y desbloquea empaque gratis
            </h2>
            <p className="mt-2 text-sm text-emerald-100/80">
              Mientras más llevas, mejor se ve tu pedido al regalar o retirar.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                Icon: Package,
                title: 'Bolsa reforzada',
                sub: `Gratis desde $${fmt(thresholds.freeReinforcedFrom)}`,
              },
              {
                Icon: Gift,
                title: 'Caja regalo',
                sub: `Gratis desde $${fmt(thresholds.freeGiftBoxFrom)}`,
              },
              {
                Icon: Truck,
                title: 'Retiro y envío',
                sub: 'Watt 205 · Renaico',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass-panel-dark flex items-start gap-3 rounded-2xl px-3.5 py-3 text-white"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-accent/20 ring-1 ring-brand-accent/30">
                  <item.Icon className="h-5 w-5 text-brand-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="text-xs text-emerald-100/85">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
