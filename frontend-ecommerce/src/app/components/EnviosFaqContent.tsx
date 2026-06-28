'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  ChevronRight,
  HelpCircle,
  MapPin,
  MessageCircle,
  Package,
  Store,
  Truck,
} from 'lucide-react';
import { formatCLP } from '../lib/money';
import { PICKUP_LINE } from '../lib/brandCopy';

type DeliveryCfg = {
  headline?: string;
  subheadline?: string;
  min_pedido_delivery_clp?: number;
  min_pedido_delivery_nota?: string;
  ventanas?: { nombre: string; horario: string; dias: string }[];
  retiro?: { direccion?: string; horario?: string; nota?: string };
  whatsapp?: string;
};

const FAQ = [
  {
    q: '¿Cuál es el mínimo para envío a domicilio?',
    a: 'Recomendamos pedidos desde $12.000 en productos (packs, combos o carrito). El minimarket suelto puede comprarse con retiro en local.',
  },
  {
    q: '¿Cuánto cuesta el envío en Renaico?',
    a: 'Desde $2.000 en comuna (hasta ~3 km desde Santiago Watt 205). Cada km adicional suma aprox. $600. El costo exacto lo ves en checkout al indicar tu dirección.',
  },
  {
    q: '¿Hay envío gratis?',
    a: 'Sí: retiro en tienda es gratis. Varios packs regalo incluyen envío gratis en Renaico. En checkout verás si tu pedido califica.',
  },
  {
    q: '¿Puedo elegir fecha de entrega?',
    a: 'Sí. En checkout indicas retiro o envío y coordinamos contigo por WhatsApp la ventana (almuerzo o cena según el día).',
  },
  {
    q: '¿Puedo cambiar el pedido después de pagar?',
    a: 'Escríbenos por WhatsApp lo antes posible. Si aún no armamos el pack, podemos ajustar. Una vez preparado, no se modifican ítems.',
  },
  {
    q: '¿Qué pasa si no estoy en casa?',
    a: 'Te contactamos antes de salir. Si no hay quien reciba, reprogramamos o dejamos en retiro en tienda según acordemos.',
  },
  {
    q: '¿Aceptan devoluciones?',
    a: 'Productos perecibles y packs armados no tienen devolución. Si hubo un error nuestro, lo resolvemos en tienda o por WhatsApp.',
  },
];

export default function EnviosFaqContent() {
  const [cfg, setCfg] = useState<DeliveryCfg | null>(null);

  useEffect(() => {
    fetch('/api/tienda/experiencias-home')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setCfg(json?.delivery_renaico ?? null))
      .catch(() => setCfg(null));
  }, []);

  const minPedido = cfg?.min_pedido_delivery_clp ?? 12000;
  const wa = cfg?.whatsapp ?? '56975647756';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-primary">Ayuda</p>
      <h1 className="mt-2 font-display text-2xl font-extrabold text-brand-ink sm:text-3xl">
        Envíos, retiro y preguntas frecuentes
      </h1>
      <p className="mt-2 text-sm text-brand-muted">
        {cfg?.subheadline ??
          'DondeMorales · Santiago Watt 205, Renaico. Pagas online y coordinamos contigo la entrega o retiro.'}
      </p>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4">
          <Store className="mb-2 h-5 w-5 text-brand-primary" />
          <h2 className="font-display font-bold text-brand-ink">Retiro en tienda</h2>
          <ul className="mt-2 space-y-1 text-sm text-brand-muted">
            <li>
              <strong className="text-brand-ink">Gratis</strong> con código tras pagar
            </li>
            <li className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {cfg?.retiro?.direccion ?? PICKUP_LINE}
            </li>
            <li>{cfg?.retiro?.horario ?? 'Lun–Dom 9:00 a 21:00'}</li>
            <li>Preparación: 24–48 h (packs regalo)</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Truck className="mb-2 h-5 w-5 text-brand-primary" />
          <h2 className="font-display font-bold text-brand-ink">Envío Renaico</h2>
          <ul className="mt-2 space-y-1 text-sm text-brand-muted">
            <li>
              Desde <strong className="text-brand-ink">${formatCLP(2000)}</strong> en comuna (~3 km)
            </li>
            <li>+ ${formatCLP(600)} por km adicional (hasta ~18 km)</li>
            <li>
              Recomendado desde <strong className="text-brand-ink">${formatCLP(minPedido)}</strong>
            </li>
            <li>Costo final en checkout al ingresar dirección</li>
          </ul>
        </div>
      </section>

      {(cfg?.ventanas ?? []).length > 0 && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="flex items-center gap-2 font-display font-bold text-brand-ink">
            <CalendarClock className="h-4 w-4 text-brand-primary" />
            Ventanas de entrega
          </h2>
          <ul className="mt-3 space-y-2">
            {cfg!.ventanas!.map((v) => (
              <li key={v.nombre} className="text-sm">
                <strong>{v.nombre}</strong> · {v.horario}
                <span className="block text-xs text-brand-muted">{v.dias}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-brand-ink">
          <HelpCircle className="h-5 w-5 text-brand-primary" />
          Preguntas frecuentes
        </h2>
        <div className="mt-4 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm open:border-brand-primary/30"
            >
              <summary className="cursor-pointer list-none text-sm font-semibold text-brand-ink marker:content-none">
                {item.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-brand-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/packs"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-primary-hover"
        >
          <Package className="h-4 w-4" />
          Ver packs
          <ChevronRight className="h-4 w-4" />
        </Link>
        <a
          href={`https://wa.me/${wa}?text=${encodeURIComponent('Hola, consulta envío/retiro dondemorales.cl')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2.5 text-sm font-bold text-[#128C7E] hover:bg-[#25D366]/20"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline">
          Volver al inicio
        </Link>
      </section>
    </div>
  );
}
