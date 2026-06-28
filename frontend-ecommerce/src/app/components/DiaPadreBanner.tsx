'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarHeart, ChevronRight, X } from 'lucide-react';

type DiaPadreCfg = {
  activo?: boolean;
  fecha_label?: string;
  headline?: string;
  subheadline?: string;
};

export default function DiaPadreBanner() {
  const [cfg, setCfg] = useState<DiaPadreCfg | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('dm_dia_padre_banner_dismiss');
      if (raw === '1') setDismissed(true);
    } catch {
      /* ignore */
    }
    fetch('/api/tienda/experiencias-home')
      .then((r) => r.json())
      .then((json) => setCfg(json.packs_tarjetas_premium?.dia_padre ?? null))
      .catch(() => setCfg(null));
  }, []);

  if (!cfg?.activo || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('dm_dia_padre_banner_dismiss', '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="sticky top-[4.25rem] z-30 mx-auto max-w-7xl px-3 sm:px-4 sm:top-[4.5rem]">
      <div className="relative overflow-hidden rounded-[1.15rem] border border-blue-400/35 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-4 py-3 shadow-premium-lg ring-1 ring-amber-400/25">
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-400/15 blur-2xl" />
        <div className="relative flex flex-wrap items-center gap-3 pr-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-100">
            <CalendarHeart className="h-3.5 w-3.5" />
            {cfg.fecha_label ?? 'Día del Padre'}
          </span>
          <p className="min-w-0 flex-1 text-sm font-semibold text-white">
            {cfg.headline ?? 'Sorprende a papá con un pack regalo completo'}
            <span className="mt-0.5 block text-xs font-normal text-white/70">
              {cfg.subheadline ?? 'Envío gratis en Renaico · contenido fijo'}
              {' · '}
              Combos cocina a pedido (sushi, pizza, chilena y más)
            </span>
          </p>
          <Link
            href="/regalos#packs-premium"
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-300"
          >
            Ver regalos y combos
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2 top-2 rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          aria-label="Ocultar aviso Día del Padre"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
