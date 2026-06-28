'use client';

import { CreditCard, Tablet } from 'lucide-react';
import { DOS_PILARES, PACK_EXPRESS_APARTE, POINT_CLIENTE } from './jh-data';

const ICONS = { pedidos: Tablet, cobro: CreditCard } as const;

export function JhPedidosVsCobro({ showPackExpressApart = true }: { showPackExpressApart?: boolean }) {
  return (
    <section id="pedidos-vs-cobro" className="scroll-mt-20 border-y border-slate-100 bg-white px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="jh-section-title text-center">Dos cosas distintas (para que no haya sorpresas)</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-[var(--jh-muted)]">
          <strong className="text-[var(--jh-ink)]">Pedir</strong> en tablet no es lo mismo que{' '}
          <strong className="text-[var(--jh-ink)]">cobrar</strong> con tarjeta. Ambas las dejamos configuradas; el
          equipo de cobro se paga aparte si aún no lo tienes.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {DOS_PILARES.map(({ id, titulo, subtitulo, detalle, enPackExpress }) => {
            const Icon = ICONS[id];
            return (
              <article
                key={id}
                className={`jh-card p-5 ${enPackExpress ? 'border-l-4 border-[var(--jh-green)]' : 'border-l-4 border-[var(--jh-orange)]'}`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`h-8 w-8 shrink-0 ${enPackExpress ? 'text-[var(--jh-green-dark)]' : 'text-[var(--jh-orange)]'}`}
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--jh-muted)]">{subtitulo}</p>
                    <h3 className="font-display text-lg font-bold text-[var(--jh-ink)]">{titulo}</h3>
                    <p className="mt-2 text-sm text-[var(--jh-muted)]">{detalle}</p>
                    <p
                      className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                        enPackExpress
                          ? 'bg-[var(--jh-green-soft)] text-[var(--jh-green-dark)]'
                          : 'bg-orange-50 text-[var(--jh-orange)]'
                      }`}
                    >
                      {enPackExpress ? 'Incluido en Pack Express' : 'Apartado del Pack Express'}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border-2 border-[var(--jh-orange)]/30 bg-[#fff7ed] p-5">
          <h3 className="font-display text-base font-bold text-[var(--jh-ink)]">{POINT_CLIENTE.titulo}</h3>
          <p className="mt-2 text-sm text-[var(--jh-muted)]">{POINT_CLIENTE.resumen}</p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--jh-ink)]">
            {POINT_CLIENTE.opciones.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="font-bold text-[var(--jh-orange)]">·</span>
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold text-[var(--jh-muted)]">
            {POINT_CLIENTE.regla}
          </p>
          <p className="mt-2 text-xs text-[var(--jh-muted)]">{POINT_CLIENTE.sinPoint}</p>
        </div>

        {showPackExpressApart && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase text-[var(--jh-muted)]">Pack Express · no incluye en el precio</p>
            <ul className="mt-2 space-y-1 text-sm text-[var(--jh-ink)]">
              {PACK_EXPRESS_APARTE.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-slate-400">○</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
