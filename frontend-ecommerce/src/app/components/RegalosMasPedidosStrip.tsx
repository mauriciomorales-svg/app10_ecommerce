'use client';

import { TrendingUp } from 'lucide-react';
import Link from 'next/link';

type Props = {
  nombres?: string[];
  packIds?: Map<string, number | null | undefined>;
};

export default function RegalosMasPedidosStrip({ nombres = [], packIds }: Props) {
  if (nombres.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200/70 bg-amber-50/60 px-3 py-2.5">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-900">
        <TrendingUp className="h-3.5 w-3.5" />
        Lo más pedido
      </span>
      {nombres.slice(0, 3).map((nombre) => {
        const id = packIds?.get(nombre);
        const href = id ? `/producto/${id}` : '/regalos#packs-premium';
        return (
          <Link
            key={nombre}
            href={href}
            className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-950 ring-1 ring-amber-200/80 transition hover:bg-amber-100"
          >
            {nombre.replace(/^Pack /i, '')}
          </Link>
        );
      })}
      <span className="text-[10px] text-amber-800/70">· referencia local — actualizar con ventas reales</span>
    </div>
  );
}
