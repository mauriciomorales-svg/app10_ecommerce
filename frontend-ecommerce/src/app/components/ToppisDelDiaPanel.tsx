'use client';

import Link from 'next/link';
import { Printer, Sparkles } from 'lucide-react';
import { toCLP } from '../lib/money';

export type ToppisDelDiaItem = {
  idproducto: number;
  nombre: string;
  precio_venta: number;
  proximo_vencimiento?: string | null;
  dias_restantes?: number | null;
  vencimiento_proximo?: boolean;
  script_cajero?: string;
};

export type ToppisDelDiaData = {
  titulo: string;
  subtitulo: string;
  actualizado?: string;
  items: ToppisDelDiaItem[];
};

type Props = {
  data: ToppisDelDiaData | null | undefined;
  variant?: 'banner' | 'print';
};

function expiryLabel(item: ToppisDelDiaItem): string | null {
  if (item.dias_restantes == null || item.proximo_vencimiento == null) return null;
  if (item.dias_restantes <= 0) return 'Vence hoy';
  if (item.dias_restantes === 1) return 'Vence mañana';
  return `Vence en ${item.dias_restantes} días`;
}

export default function ToppisDelDiaPanel({ data, variant = 'banner' }: Props) {
  if (!data?.items?.length) return null;

  const isPrint = variant === 'print';

  return (
    <section
      className={
        isPrint
          ? 'mx-auto max-w-2xl bg-white p-8 text-brand-ink print:p-6'
          : 'relative mb-6 overflow-hidden rounded-[1.25rem] border border-rose-200/80 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4 shadow-inner-soft sm:p-5'
      }
    >
      {!isPrint && (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-rose-600">
              <Sparkles className="h-3 w-3" />
              Minimarket + helados
            </p>
            <h3 className="font-display text-lg font-extrabold text-brand-ink">{data.titulo}</h3>
            <p className="mt-0.5 text-xs text-brand-muted">{data.subtitulo}</p>
          </div>
          <Link
            href="/helados/toppis-del-dia"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-[11px] font-bold text-rose-800 hover:bg-rose-50"
          >
            <Printer className="h-3.5 w-3.5" />
            Cartel mostrador
          </Link>
        </div>
      )}

      {isPrint && (
        <header className="mb-6 border-b-2 border-rose-300 pb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">DondeMorales · Toppi&apos;s</p>
          <h1 className="font-display mt-2 text-3xl font-black">{data.titulo}</h1>
          <p className="mt-2 text-sm text-gray-600">{data.subtitulo}</p>
          <p className="mt-1 text-xs text-gray-400">Watt 205 · Renaico</p>
        </header>
      )}

      <ul className={`grid gap-3 ${isPrint ? 'sm:grid-cols-1' : 'sm:grid-cols-3'}`}>
        {data.items.map((item) => {
          const expiry = expiryLabel(item);
          return (
            <li
              key={item.idproducto}
              className={
                isPrint
                  ? 'rounded-xl border-2 border-gray-200 p-4'
                  : 'rounded-xl border border-white/80 bg-white/90 p-3 shadow-sm'
              }
            >
              <p className="font-display text-base font-extrabold leading-tight text-brand-ink">{item.nombre}</p>
              <p className="mt-1 font-display text-lg font-bold text-rose-700">{toCLP(item.precio_venta)}</p>
              {expiry && (
                <p
                  className={`mt-1 text-xs font-semibold ${
                    item.vencimiento_proximo ? 'text-amber-700' : 'text-gray-500'
                  }`}
                >
                  {expiry}
                </p>
              )}
              {item.script_cajero && (
                <p className={`mt-2 text-xs leading-relaxed text-gray-600 ${isPrint ? 'text-sm italic' : ''}`}>
                  {isPrint ? `«${item.script_cajero}»` : item.script_cajero}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {isPrint && (
        <footer className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
          Córtala, tritúrala y coroná el helado · Actualizado{' '}
          {data.actualizado ? new Date(data.actualizado).toLocaleString('es-CL') : 'hoy'}
        </footer>
      )}

      {isPrint && (
        <div className="mt-6 hidden print:block text-center text-[10px] text-gray-400">
          Imprime este cartel y ponlo junto a la máquina de helados
        </div>
      )}
    </section>
  );
}
