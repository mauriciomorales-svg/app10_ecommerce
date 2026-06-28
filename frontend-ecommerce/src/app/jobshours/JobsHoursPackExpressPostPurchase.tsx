'use client';

import Link from 'next/link';
import { MessageCircle, Package, Printer } from 'lucide-react';
import type { VentaPickupPublic } from '../lib/checkout';
import { formatCLP } from '../lib/money';
import { L, PACK_EXPRESS_APARTE, POINT_CLIENTE, PRECIOS, WHATSAPP } from './jh-data';
import { isPackAndandoIntent, isPackExpressIntent, type JhPurchaseIntent } from './jh-purchase-intent';

const WHATSAPP_BASE = `https://wa.me/${WHATSAPP}`;

function waLink(text: string) {
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(text)}`;
}

export function JobsHoursPackExpressPostPurchase({
  venta,
  intent,
}: {
  venta: VentaPickupPublic;
  intent: JhPurchaseIntent | null;
}) {
  const total = Number(venta.total ?? 0);
  const isExpress = isPackExpressIntent(intent, total);
  const isAndando = !isExpress && isPackAndandoIntent(intent, total);

  const timeline = isExpress
    ? [
        { day: 'Hoy', title: 'Pago confirmado', detail: 'Guarda tu referencia #' + venta.idventa + '. Te escribimos por WhatsApp.' },
        { day: '1–2', title: 'Preparamos tu tablet', detail: 'Cargamos menú base y revisamos datos de tu negocio.' },
        { day: '3–5', title: 'Instalación', detail: 'Mercado Pago, menú en pantalla y prueba de cobro contigo.' },
        { day: '6–7', title: 'Entrega + enseñanza', detail: 'Tablet en mostrador (o envío coordinado) y 30 min de uso.' },
      ]
    : [
        { day: 'Hoy', title: 'Pago confirmado', detail: 'Referencia #' + venta.idventa },
        { day: '24 h', title: 'WhatsApp', detail: 'Coordinamos visita o videollamada según tu pack.' },
        { day: '3–7', title: 'Instalación', detail: 'Mercado Pago, menú y enseñanza ~30 min.' },
      ];

  const waText = isExpress
    ? `Hola, pagué Pack JobsHours Express (pedido #${venta.idventa}). Quiero coordinar entrega de tablet e instalación.`
    : isAndando
      ? `Hola, pagué «${L.packAndando}» (pedido #${venta.idventa}). Quiero coordinar instalación en mi local.`
      : `Hola, pagué el pedido #${venta.idventa} en tienda JobsHours. Quiero coordinar la instalación.`;

  return (
    <div className="mb-6 space-y-4 text-left">
      <div className="rounded-2xl border-2 border-[var(--jh-orange)]/40 bg-[#fff7ed] p-5">
        <div className="flex items-start gap-3">
          <Package className="h-8 w-8 shrink-0 text-[var(--jh-orange)]" />
          <div>
            <h2 className="font-display text-lg font-bold text-[var(--jh-ink)]">
              {isExpress ? 'Pack Express confirmado' : isAndando ? `${L.packAndando} confirmado` : 'Pago confirmado'}
            </h2>
            <p className="mt-1 text-sm text-[var(--jh-muted)]">
              Total pagado: <strong>{formatCLP(total)}</strong>
              {isExpress && (
                <>
                  {' '}
                  · Incluye tablet + instalación + primer mes ({formatCLP(PRECIOS.planMinimo)})
                </>
              )}
              {isAndando && (
                <>
                  {' '}
                  · Instalación {formatCLP(PRECIOS.implAndando)} + mes 1 {formatCLP(PRECIOS.planMinimo)}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5">
        <h3 className="font-display font-bold text-[var(--jh-ink)]">Tu línea de tiempo</h3>
        <ol className="mt-4 space-y-3">
          {timeline.map(({ day, title, detail }) => (
            <li key={day + title} className="flex gap-3 text-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-[var(--jh-green-dark)] shadow-sm">
                {day}
              </span>
              <div>
                <p className="font-semibold text-[var(--jh-ink)]">{title}</p>
                <p className="text-[var(--jh-muted)]">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {isExpress && (
        <div className="rounded-xl border border-orange-200 bg-orange-50/80 p-4 text-sm">
          <p className="font-semibold text-[var(--jh-ink)]">{POINT_CLIENTE.titulo}</p>
          <p className="mt-1 text-[var(--jh-muted)]">{POINT_CLIENTE.sinPoint}</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--jh-muted)]">
            {PACK_EXPRESS_APARTE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {isExpress && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <p className="font-semibold text-[var(--jh-ink)]">Qué debes tener listo en el local</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[var(--jh-muted)]">
            <li>Wi‑Fi con clave disponible</li>
            <li>RUT del negocio y acceso a correo o celular del dueño</li>
            <li>Lista de platos/bebidas (foto del menú sirve)</li>
            <li>Enchufe cerca del mostrador para la tablet</li>
            <li>Si ya tienes Point: tenerla a mano para enlazarla</li>
          </ul>
          <Link
            href="/entrega-pack-express"
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--jh-green-dark)] hover:underline"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir guía de entrega (PDF / A4)
          </Link>
        </div>
      )}

      <a
        href={waLink(waText)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-emerald-700"
      >
        <MessageCircle className="h-5 w-5" />
        Coordinar por WhatsApp ahora
      </a>

      <p className="text-center text-[11px] text-[var(--jh-muted)]">
        Lun–Sáb 09:00–21:00 · Si no respondemos al instante, deja tu mensaje con el número de pedido.
      </p>
    </div>
  );
}

/** Post-compra genérica (solo programa mensual, etc.) */
export function JobsHoursGenericPostPurchase({ venta }: { venta: VentaPickupPublic }) {
  const waText = `Hola, pagué el pedido #${venta.idventa} en tienda JobsHours. Quiero coordinar la instalación.`;
  return (
    <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-left">
      <h2 className="font-display font-bold text-[var(--jh-ink)]">Qué sigue ahora</h2>
      <ol className="mt-4 space-y-3 text-sm">
        <li>
          <p className="font-semibold">1. Te contactamos</p>
          <p className="text-gray-600">Por WhatsApp en 24 h con tu referencia de pago.</p>
        </li>
        <li>
          <p className="font-semibold">2. Instalación</p>
          <p className="text-gray-600">Mercado Pago, menú en tablet y prueba de cobro.</p>
        </li>
        <li>
          <p className="font-semibold">3. Enseñanza</p>
          <p className="text-gray-600">~30 min para operar el día a día.</p>
        </li>
      </ol>
      <a
        href={waLink(waText)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
      >
        <MessageCircle className="h-4 w-4" />
        Escribir por WhatsApp
      </a>
    </div>
  );
}
