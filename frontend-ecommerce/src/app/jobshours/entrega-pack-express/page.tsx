'use client';

import Link from 'next/link';
import { Printer } from 'lucide-react';
import { L, PACK_EXPRESS_APARTE, POINT_CLIENTE, PRECIOS, WHATSAPP_DISPLAY } from '../jh-data';
import { JhPedidosVsCobro } from '../JhPedidosVsCobro';
import { formatCLP } from '../../lib/money';

const TIMELINE = [
  { day: 'Hoy', title: 'Pago confirmado', detail: 'Guarda tu número de pedido. Te escribimos por WhatsApp.' },
  { day: '1–2', title: 'Preparamos tablet', detail: 'Menú base, pruebas y datos de tu negocio.' },
  { day: '3–5', title: 'Instalación', detail: `${L.mp}, menú en pantalla y prueba de cobro contigo.` },
  { day: '6–7', title: 'Entrega + enseñanza', detail: 'Tablet en mostrador (o envío coordinado) · ~30 min de uso.' },
] as const;

const CHECKLIST_CLIENTE = [
  'Wi‑Fi con clave disponible en mostrador',
  'RUT del negocio y celular del dueño o encargado',
  'Lista de platos/bebidas (foto del menú sirve)',
  'Enchufe cerca del mostrador para la tablet',
  'Maquinita Point: si no tienes, cotizar aparte (MP o con JobsHours)',
] as const;

export default function EntregaPackExpressPage() {
  return (
    <div className="jh-root min-h-screen bg-white text-[var(--jh-ink)] print:bg-white">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .jh-root { padding: 0; }
          .print-sheet { box-shadow: none !important; margin: 0 !important; max-width: none !important; }
        }
      `}</style>

      <header className="no-print border-b border-slate-100 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/comida" className="text-sm font-bold text-[var(--jh-green-dark)] hover:underline">
            ← Volver a comida
          </Link>
          <button
            type="button"
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--jh-green-dark)] px-3 py-2 text-xs font-bold text-white"
          >
            <Printer className="h-4 w-4" />
            Imprimir A4
          </button>
        </div>
      </header>

      <article className="print-sheet mx-auto max-w-2xl px-4 py-8 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--jh-orange)]">JobsHours · Pack Express</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold">Tu guía de entrega</h1>
        <p className="mt-2 text-sm text-[var(--jh-muted)]">
          Pack JobsHours Express · {formatCLP(PRECIOS.packExpress)} · tablet + instalación + primer mes
        </p>

        <section className="mt-8">
          <h2 className="font-display text-lg font-bold">Línea de tiempo (7 días hábiles)</h2>
          <ol className="mt-4 space-y-3">
            {TIMELINE.map(({ day, title, detail }) => (
              <li key={title} className="flex gap-3 rounded-xl border border-slate-100 p-3 text-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--jh-green-soft)] text-xs font-extrabold text-[var(--jh-green-dark)]">
                  {day}
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-[var(--jh-muted)]">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 rounded-2xl border-2 border-[var(--jh-green-dark)]/30 bg-[var(--jh-green-soft)] p-5">
          <h2 className="font-display font-bold">Ten listo en el local</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-[var(--jh-muted)]">
            {CHECKLIST_CLIENTE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-xl border border-orange-200 bg-orange-50/50 p-4 text-sm">
          <h2 className="font-display font-bold">Maquinita de cobro (aparte)</h2>
          <p className="mt-2 text-[var(--jh-muted)]">{POINT_CLIENTE.resumen}</p>
          <ul className="mt-2 list-inside list-disc text-[var(--jh-muted)]">
            {PACK_EXPRESS_APARTE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mt-8 text-sm">
          <h2 className="font-display font-bold">Qué incluye el pack</h2>
          <ul className="mt-2 space-y-1 text-[var(--jh-muted)]">
            <li>Tablet 10&quot; configurada para mostrador</li>
            <li>Instalación: {L.mp}, menú y enseñanza</li>
            <li>Primer mes del programa ({formatCLP(PRECIOS.planMinimo)} después)</li>
          </ul>
        </section>

        <p className="mt-10 border-t border-slate-200 pt-6 text-center text-sm font-semibold">
          WhatsApp {WHATSAPP_DISPLAY} · Lun–Sáb 09:00–21:00
        </p>
        <p className="mt-1 text-center text-[10px] text-[var(--jh-muted)]">
          Tiendas Inteligentes JobsHours · Araucanía
        </p>
      </article>

      <div className="no-print">
        <JhPedidosVsCobro showPackExpressApart={false} />
      </div>
    </div>
  );
}
