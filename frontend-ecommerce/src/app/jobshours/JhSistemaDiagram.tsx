'use client';

import { CreditCard, Plus, Tablet, Wifi, Wrench } from 'lucide-react';
import { L } from './jh-data';

const PARTS = [
  {
    icon: Wrench,
    title: `Programa ${L.programa}`,
    sub: 'Menú, pedidos y Mercado Pago',
    iconClass: 'text-[var(--jh-green-dark)]',
    bgClass: 'bg-[var(--jh-green-soft)]',
  },
  {
    icon: Tablet,
    title: 'Tu tablet o PC',
    sub: 'En Pack Express va incluida',
    iconClass: 'text-[var(--jh-green-dark)]',
    bgClass: 'bg-emerald-50',
  },
  {
    icon: CreditCard,
    title: 'Point o QR celular',
    sub: 'Cobro con tarjeta · aparte',
    iconClass: 'text-[var(--jh-orange)]',
    bgClass: 'bg-orange-50',
  },
  {
    icon: Wifi,
    title: 'Wi‑Fi estable',
    sub: 'En tu local',
    iconClass: 'text-slate-600',
    bgClass: 'bg-slate-100',
  },
] as const;

export function JhSistemaDiagram({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white ${compact ? 'p-4 shadow-sm' : 'p-5 shadow-md md:p-6'}`}
      aria-label="Componentes del sistema JobsHours"
    >
      <p className="text-center text-xs font-bold uppercase tracking-wide text-[var(--jh-muted)]">
        Qué arma el sistema completo
      </p>
      <div className="mt-4 flex flex-wrap items-stretch justify-center gap-2 sm:gap-3">
        {PARTS.map(({ icon: Icon, title, sub, iconClass, bgClass }, i) => (
          <div key={title} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && (
              <Plus
                className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block"
                aria-hidden
              />
            )}
            <div
              className={`flex min-w-[7.5rem] max-w-[9.5rem] flex-1 flex-col items-center rounded-xl border border-slate-100 px-2 py-3 text-center sm:min-w-[8.5rem] ${bgClass}`}
            >
              <Icon className={`h-6 w-6 ${iconClass}`} strokeWidth={2} />
              <p className="mt-2 text-[11px] font-extrabold leading-tight text-[var(--jh-ink)] sm:text-xs">{title}</p>
              <p className="mt-0.5 text-[10px] font-medium leading-snug text-[var(--jh-muted)]">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm font-bold text-[var(--jh-ink)]">
        = Cliente pide · paga · comanda a cocina
      </p>
      <p className="mt-1 text-center text-xs text-[var(--jh-muted)]">
        JobsHours configura el programa e instalación · tú aportas equipo de cobro si aún no lo tienes
      </p>
    </div>
  );
}
