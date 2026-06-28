'use client';

import Link from 'next/link';
import { Check, Scale } from 'lucide-react';
import type { RegalosExperienciaBlock } from '../context/RegalosExperienciaContext';
import { trackCommerceEvent } from '../lib/commerceEvents';
import { toCLP } from '../lib/money';

type Props = {
  compare?: RegalosExperienciaBlock['compare'];
  masPedidos?: string[];
};

type ComparePack = {
  nombre: string;
  ocasion?: string;
  modalidad?: string;
  destaca?: string;
  idproducto?: number | null;
  precio?: number | null;
  siempre_incluye?: string[];
};

function PackCompareCard({
  pack,
  recomendado,
}: {
  pack: ComparePack;
  recomendado: boolean;
}) {
  return (
    <article className="rounded-[1.15rem] border border-rose-100 bg-white p-4 shadow-premium lg:hidden">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display font-extrabold text-brand-ink">{pack.nombre}</p>
          {pack.modalidad && (
            <p className="text-[10px] uppercase tracking-wide text-brand-muted">{pack.modalidad}</p>
          )}
        </div>
        {recomendado && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-900">
            Top
          </span>
        )}
      </div>
      {pack.precio != null && (
        <p className="mt-2 font-display text-xl font-extrabold text-rose-700">{toCLP(pack.precio)}</p>
      )}
      <ul className="mt-2 space-y-0.5 text-xs text-brand-muted">
        {(pack.siempre_incluye ?? []).slice(0, 4).map((line) => (
          <li key={line} className="flex items-start gap-1">
            <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
            {line}
          </li>
        ))}
      </ul>
      {pack.destaca && <p className="mt-2 text-[11px] font-medium text-rose-800/80">{pack.destaca}</p>}
      {pack.idproducto ? (
        <Link
          href={`/producto/${pack.idproducto}`}
          onClick={() =>
            trackCommerceEvent('regalo_compare_click', {
              pack: pack.nombre,
              idproducto: pack.idproducto,
            })
          }
          className="mt-3 block w-full rounded-xl bg-rose-600 py-2.5 text-center text-xs font-bold text-white hover:bg-rose-700"
        >
          Reservar
        </Link>
      ) : null}
    </article>
  );
}

export default function PackCompareSection({ compare, masPedidos = [] }: Props) {
  const packs = compare?.packs ?? [];
  if (packs.length === 0) return null;

  const masSet = new Set(masPedidos);

  return (
    <section id="comparar-packs" className="premium-experience-section premium-experience-section--regalos mb-8 scroll-mt-24">
      <div className="premium-section-head mb-4">
        <span className="premium-kicker inline-flex items-center gap-1">
          <Scale className="h-3.5 w-3.5" />
          Comparador
        </span>
        <h2 className="premium-heading">{compare?.titulo ?? 'Compara packs listos'}</h2>
        {compare?.subtitulo && <p className="premium-subhead">{compare.subtitulo}</p>}
      </div>

      <div className="grid gap-3 lg:hidden">
        {packs.map((pack) => (
          <PackCompareCard key={pack.nombre} pack={pack} recomendado={masSet.has(pack.nombre)} />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-[1.25rem] border border-rose-100 bg-white/90 shadow-premium lg:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-rose-100 bg-rose-50/50">
              <th className="px-4 py-3 font-semibold text-brand-muted">Pack</th>
              <th className="px-4 py-3 font-semibold text-brand-muted">Precio</th>
              <th className="px-4 py-3 font-semibold text-brand-muted">Incluye</th>
              <th className="px-4 py-3 font-semibold text-brand-muted">Destaca</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {packs.map((pack) => {
              const recomendado = masSet.has(pack.nombre);
              return (
                <tr key={pack.nombre} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-bold text-brand-ink">{pack.nombre}</p>
                    {pack.modalidad && (
                      <p className="text-[10px] uppercase tracking-wide text-brand-muted">{pack.modalidad}</p>
                    )}
                    {recomendado && (
                      <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase text-amber-900">
                        Recomendado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-display font-extrabold text-rose-700">
                    {pack.precio != null ? toCLP(pack.precio) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <ul className="space-y-0.5 text-xs text-brand-muted">
                      {(pack.siempre_incluye ?? []).slice(0, 4).map((line) => (
                        <li key={line} className="flex items-start gap-1">
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-muted">{pack.destaca}</td>
                  <td className="px-4 py-3">
                    {pack.idproducto ? (
                      <Link
                        href={`/producto/${pack.idproducto}`}
                        onClick={() =>
                          trackCommerceEvent('regalo_compare_click', {
                            pack: pack.nombre,
                            idproducto: pack.idproducto,
                          })
                        }
                        className="inline-flex rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                      >
                        Reservar
                      </Link>
                    ) : (
                      <span className="text-xs text-brand-muted">Próximamente</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
