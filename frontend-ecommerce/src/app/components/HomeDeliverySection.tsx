'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, ChevronRight, MapPin, Package, Truck } from 'lucide-react';
import { formatCLP } from '../lib/money';

type Ventana = { nombre: string; horario: string; dias: string };
type Destacado = { titulo: string; detalle: string; href: string; precio_desde?: number | null };
type DeliveryCfg = {
  activo?: boolean;
  headline?: string;
  subheadline?: string;
  badge?: string;
  min_pedido_delivery_clp?: number;
  min_pedido_delivery_nota?: string;
  ventanas?: Ventana[];
  pasos?: { titulo: string; texto: string }[];
  destacados?: Destacado[];
  retiro?: { direccion?: string; horario?: string; nota?: string };
};

export default function HomeDeliverySection() {
  const [cfg, setCfg] = useState<DeliveryCfg | null>(null);

  useEffect(() => {
    fetch('/api/tienda/experiencias-home')
      .then((r) => r.json())
      .then((json) => setCfg(json.delivery_renaico ?? null))
      .catch(() => setCfg(null));
  }, []);

  if (!cfg?.activo) return null;

  const ventanas = cfg.ventanas ?? [];
  const pasos = cfg.pasos ?? [];
  const destacados = cfg.destacados ?? [];
  const minPedido = cfg.min_pedido_delivery_clp ?? 0;

  return (
    <section className="mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-4">
      <div className="relative overflow-hidden rounded-[1.65rem] border border-emerald-200/60 bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 p-5 shadow-premium-lg sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">
              <Truck className="h-3.5 w-3.5" />
              {cfg.badge ?? 'Reparto Renaico'}
            </span>
            <h2 className="mt-3 font-display text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              {cfg.headline ?? 'Reparto a domicilio en Renaico'}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-emerald-100/85">
              {cfg.subheadline ??
                'En Renaico casi no hay reparto fijo — pedimos con fecha, salimos en tandas y te confirmamos la ventana.'}
            </p>

            {minPedido > 0 && (
              <p className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs text-amber-50">
                <strong>Pedido recomendado para envío:</strong> desde ${formatCLP(minPedido)} en productos.
                {cfg.min_pedido_delivery_nota ? ` ${cfg.min_pedido_delivery_nota}` : null}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {destacados.map((d) => (
                <Link
                  key={d.titulo}
                  href={d.href}
                  className="group inline-flex min-w-[140px] flex-1 flex-col rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 transition hover:border-emerald-400/40 hover:bg-black/40 sm:max-w-[200px]"
                >
                  <span className="text-xs font-bold text-white">{d.titulo}</span>
                  <span className="text-[11px] text-emerald-100/75">{d.detalle}</span>
                  {d.precio_desde ? (
                    <span className="mt-1 text-[10px] font-semibold text-amber-200">
                      Desde ${formatCLP(d.precio_desde)}
                    </span>
                  ) : null}
                  <ChevronRight className="mt-1 h-3.5 w-3.5 text-emerald-300/60 transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {ventanas.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-200">
                  <CalendarClock className="h-4 w-4" />
                  Ventanas de entrega
                </p>
                <ul className="space-y-2">
                  {ventanas.map((v) => (
                    <li key={v.nombre} className="text-sm text-white/90">
                      <strong>{v.nombre}</strong> · {v.horario}
                      <span className="block text-[11px] text-emerald-100/65">{v.dias}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pasos.length > 0 && (
              <ol className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4">
                {pasos.map((p, i) => (
                  <li key={p.titulo} className="flex gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-200">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{p.titulo}</p>
                      <p className="text-[11px] text-emerald-100/70">{p.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <div className="flex flex-wrap items-start gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-[11px] text-emerald-100/80">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
              <span>
                <strong className="text-white">Retiro gratis:</strong>{' '}
                {cfg.retiro?.direccion ?? 'Santiago Watt 205, Renaico'} · {cfg.retiro?.horario ?? '9:00–21:00'}
              </span>
            </div>

            <Link
              href="/envios"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 sm:w-auto"
            >
              Tarifas y preguntas frecuentes
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/packs"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-emerald-950 shadow-lg transition hover:bg-emerald-300 sm:w-auto"
            >
              <Package className="h-4 w-4" />
              Ver packs con envío
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
