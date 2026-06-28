'use client';

import Link from 'next/link';
import { formatCLP } from '../lib/money';
import { L, PRECIOS } from './jh-data';
import type { JobshoursProducto } from './useJobshoursProducts';

const PLAN_PUBLIC = {
  'JH-01': { title: 'Menos filas', line: 'El cliente pide y paga solo' },
  'JH-02': { title: 'Menos WhatsApp', line: 'Incluye lo anterior + WhatsApp contesta solo' },
  'JH-03': { title: 'También en web', line: 'Incluye lo anterior + vendes por internet' },
} as const;

function CheckCell({ value }: { value: boolean | string }) {
  if (value === true) return <span className="jh-check-yes">✓</span>;
  if (value === false) return <span className="jh-check-no">—</span>;
  return <span className="text-xs font-semibold text-[var(--jh-muted)]">{value}</span>;
}

export type JhPlansChecklistLinkMode = 'catalog' | 'comida';

export function JhPlansChecklistSection({
  plans,
  onSelectPlan,
  linkMode = 'catalog',
}: {
  plans: { sku: string; product?: JobshoursProducto }[];
  onSelectPlan: (p: JobshoursProducto) => void;
  linkMode?: JhPlansChecklistLinkMode;
}) {
  const catalog = linkMode === 'comida' ? '/catalogo' : '';

  const cols = [
    {
      sku: 'JH-01',
      title: PLAN_PUBLIC['JH-01'].title,
      line: PLAN_PUBLIC['JH-01'].line,
      price: PRECIOS.planMinimo,
      highlight: true,
    },
    {
      sku: 'JH-02',
      title: PLAN_PUBLIC['JH-02'].title,
      line: PLAN_PUBLIC['JH-02'].line,
      price: PRECIOS.planIA,
      highlight: false,
    },
    {
      sku: 'JH-03',
      title: PLAN_PUBLIC['JH-03'].title,
      line: PLAN_PUBLIC['JH-03'].line,
      price: PRECIOS.planOmni,
      highlight: false,
    },
  ] as const;

  const mainRows: { label: string; values: (boolean | string)[] }[] = [
    {
      label: 'Ideal si hoy…',
      values: ['Hay fila y no alcanzo a cobrar', 'Me saturan por WhatsApp', 'También vendo por internet'],
    },
    { label: 'Tablet de pedidos · cliente pide y paga solo', values: [true, true, true] },
    { label: 'Mercado Pago (tarjeta + pago con celular)', values: [true, true, true] },
    { label: 'Menú en pantalla (~20 platos/bebidas)', values: [true, true, true] },
    { label: 'Opciones extra en el pedido', values: [true, true, true] },
    { label: 'Pedido en pantalla · tú preparas', values: [true, true, true] },
    { label: 'Soporte WhatsApp Lun–Sáb', values: [true, true, true] },
    { label: 'Enseñanza inicial ~30 min', values: [true, true, true] },
    { label: 'WhatsApp contesta solo en hora punta', values: [false, true, true] },
    { label: 'Tienda por internet · mismo inventario', values: [false, false, true] },
  ];

  const setupRows: { label: string; solo: boolean | string; feria: boolean | string }[] = [
    { label: 'Tablet de pedidos lista para vender', solo: true, feria: true },
    { label: 'Instalación en local o remota', solo: false, feria: true },
    { label: 'Primer mes en un solo pago', solo: false, feria: true },
  ];

  const productFor = (sku: string) => plans.find((p) => p.sku === sku)?.product;

  const retailHref = `${catalog}#retail-planes`;
  const omniHref = `${catalog}#omnicanal-rutas`;
  const desgloseHref = `${catalog}#que-pagas`;
  const pagarHref = linkMode === 'comida' ? '#ofertas' : `${catalog}#pagar`;

  return (
    <section id="planes" className="scroll-mt-20 border-b border-slate-100 bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="jh-section-title text-center">¿Qué te pasa hoy en el mostrador?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm font-semibold text-[var(--jh-ink)]">
          Elige la columna que te describe. Cada una incluye la de la izquierda — solo mira el precio.
        </p>
        <p className="mx-auto mt-2 max-w-xl text-center text-xs text-[var(--jh-muted)]">
          ¿Vendes en góndola?{' '}
          {linkMode === 'comida' ? (
            <Link href={retailHref} className="font-bold text-[#2563eb] hover:underline">
              Ver barra e inventario en catálogo ↓
            </Link>
          ) : (
            <a href={retailHref} className="font-bold text-[#2563eb] hover:underline">
              Ver barra e inventario ↓
            </a>
          )}
          {' · '}¿Comida y góndola?{' '}
          {linkMode === 'comida' ? (
            <Link href={omniHref} className="font-bold text-[var(--jh-green-dark)] hover:underline">
              Ver local mixto en catálogo ↓
            </Link>
          ) : (
            <a href={omniHref} className="font-bold text-[var(--jh-green-dark)] hover:underline">
              Ver local mixto ↓
            </a>
          )}
        </p>

        <div className="jh-compare-wrap mt-8">
          <table className="jh-compare-table">
            <thead>
              <tr>
                <th>¿Qué trae?</th>
                {cols.map((c) => (
                  <th key={c.sku} className={c.highlight ? 'col-highlight' : ''}>
                    <div className="font-display text-base leading-tight">{c.title}</div>
                    <div className="mt-1 text-[10px] font-medium leading-snug text-[var(--jh-muted)]">{c.line}</div>
                    <div className="mt-2 text-lg font-extrabold text-[var(--jh-green-dark)]">
                      {formatCLP(c.price)}
                      <span className="text-xs font-semibold text-[var(--jh-muted)]">/mes</span>
                    </div>
                    {productFor(c.sku) && (
                      <button
                        type="button"
                        onClick={() => {
                          const p = productFor(c.sku);
                          if (p) onSelectPlan(p);
                        }}
                        className="jh-btn-secondary mt-2 !px-3 !py-1.5 text-[11px]"
                      >
                        Quiero este
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mainRows.map(({ label, values }) => (
                <tr key={label}>
                  <td>{label}</td>
                  {values.map((v, i) => (
                    <td key={cols[i].sku} className={cols[i].highlight ? 'col-highlight text-center' : 'text-center'}>
                      <CheckCell value={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-center text-xs font-semibold text-[var(--jh-muted)]">
          En todos los planes: tú compras tablet, maquinita y Wi‑Fi · JobsHours configura el programa y Mercado Pago
        </p>

        <h3 className="mt-12 text-center font-display text-lg font-bold text-[var(--jh-ink)]">
          ¿Qué pagas hoy además del pago de cada mes?
        </h3>
        <p className="mt-2 text-center text-sm text-[var(--jh-muted)]">
          Columna izquierda: solo el mes 1 del programa. Columna derecha: instalación + mes 1 (dos cobros en un solo
          pago).
        </p>
        <div className="jh-compare-wrap mx-auto mt-6 max-w-2xl">
          <table className="jh-compare-table" style={{ minWidth: 400 }}>
            <thead>
              <tr>
                <th />
                <th>Solo pago del mes</th>
                <th className="col-highlight">{L.packAndando}</th>
              </tr>
              <tr>
                <td className="text-left text-xs font-semibold">Pago de cada mes (mes 1)</td>
                <td className="text-center font-extrabold">{formatCLP(PRECIOS.planMinimo)}</td>
                <td className="col-highlight text-center font-extrabold">{formatCLP(PRECIOS.planMinimo)}</td>
              </tr>
              <tr>
                <td className="text-left text-xs font-semibold">Instalación (una vez)</td>
                <td className="text-center text-sm text-[var(--jh-muted)]">
                  Aparte · desde {formatCLP(PRECIOS.implActivacion)}
                </td>
                <td className="col-highlight text-center font-extrabold text-[var(--jh-orange)]">
                  {formatCLP(PRECIOS.implAndando)}
                </td>
              </tr>
              <tr>
                <td className="text-left text-xs font-bold">Total si pagas hoy</td>
                <td className="text-center font-extrabold">{formatCLP(PRECIOS.planMinimo)}</td>
                <td className="col-highlight text-center font-extrabold text-[var(--jh-orange)]">
                  {formatCLP(PRECIOS.comboAndando)}
                </td>
              </tr>
            </thead>
            <tbody>
              {setupRows.map(({ label, solo, feria }) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="text-center">
                    <CheckCell value={solo} />
                  </td>
                  <td className="col-highlight text-center">
                    <CheckCell value={feria} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-center">
          {linkMode === 'comida' ? (
            <Link href={desgloseHref} className="text-sm font-bold text-[var(--jh-green-dark)] hover:underline">
              Desglose instalación (Mercado Pago, menú, visita) →
            </Link>
          ) : (
            <a href={desgloseHref} className="text-sm font-bold text-[var(--jh-green-dark)] hover:underline">
              Desglose instalación (Mercado Pago, menú, visita) ↓
            </a>
          )}
          {' · '}
          <a href={pagarHref} className="text-sm font-bold text-[var(--jh-orange)] hover:underline">
            {linkMode === 'comida' ? 'Ver packs arriba ↑' : 'Pagar ↓'}
          </a>
        </p>
      </div>
    </section>
  );
}
