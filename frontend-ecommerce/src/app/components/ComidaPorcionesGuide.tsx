'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Users } from 'lucide-react';
import type { RegalosExperienciaBlock } from '../context/RegalosExperienciaContext';

type Props = {
  data?: RegalosExperienciaBlock['comida_porciones'];
};

export default function ComidaPorcionesGuide({ data }: Props) {
  const filas = data?.filas ?? [];
  const [buscar, setBuscar] = useState('');

  const filtered = useMemo(() => {
    const q = buscar.trim().toLowerCase();
    if (!q) return filas;
    return filas.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.detalle.toLowerCase().includes(q) ||
        f.buscar.toLowerCase().includes(q),
    );
  }, [filas, buscar]);

  if (filas.length === 0) return null;

  return (
    <section id="guia-porciones" className="mb-8 scroll-mt-24">
      <div className="overflow-hidden rounded-[1.35rem] border border-amber-200/60 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 p-4 shadow-premium sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-600/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
              <Users className="h-3 w-3" />
              Guía
            </span>
            <h2 className="mt-1 font-display text-lg font-extrabold text-brand-ink">
              {data?.titulo ?? '¿Cuántos comen?'}
            </h2>
            {data?.subtitulo && <p className="text-sm text-brand-muted">{data.subtitulo}</p>}
          </div>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <input
              type="search"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar plato…"
              className="w-full rounded-xl border border-amber-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {filtered.map((fila) => (
            <Link
              key={fila.buscar}
              href={`/salada?buscar=${encodeURIComponent(fila.buscar)}`}
              className="group rounded-xl border border-amber-100 bg-white p-3 transition hover:border-amber-300 hover:shadow-md"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                {fila.personas} personas
              </p>
              <p className="mt-1 font-display font-extrabold text-brand-ink group-hover:text-amber-900">
                {fila.label}
              </p>
              <p className="mt-0.5 text-xs text-brand-muted">{fila.detalle}</p>
              <p className="mt-2 text-[10px] font-semibold text-amber-800/70">{fila.buscar}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
