'use client';

import Image from 'next/image';
import { Plus, Sparkles } from 'lucide-react';
import { useRegalosExperienciaFetch } from '../context/RegalosExperienciaContext';
import { useCartFeedback } from '../hooks/useCartFeedback';
import { formatCLP, toCLP } from '../lib/money';
import { trackCommerceEvent } from '../lib/commerceEvents';

type Props = {
  cartProductIds: number[];
};

export default function RegaloCheckoutUpsell({ cartProductIds }: Props) {
  const experiencia = useRegalosExperienciaFetch();
  const { addWithFeedback } = useCartFeedback();
  const upsell = experiencia?.checkout_upsell;
  const items = (upsell?.items ?? []).filter(
    (i) => i.idproducto && !cartProductIds.includes(i.idproducto),
  );

  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50/60 to-white p-4">
      <div className="mb-3 flex items-start gap-2">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
        <div>
          <p className="text-sm font-bold text-brand-ink">{upsell?.titulo ?? 'Completa tu regalo'}</p>
          {upsell?.subtitulo && <p className="text-xs text-brand-muted">{upsell.subtitulo}</p>}
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.idproducto}
            className="flex items-center gap-3 rounded-xl border border-rose-100 bg-white p-2.5"
          >
            {item.imagen_url ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <Image src={item.imagen_url} alt={item.nombre_producto ?? item.nombre} fill className="object-cover" sizes="48px" />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-400">
                <Plus className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-brand-ink">
                {item.nombre_producto ?? item.nombre}
              </p>
              {item.mensaje && <p className="text-[10px] text-brand-muted">{item.mensaje}</p>}
              {item.precio != null && (
                <p className="text-xs font-bold text-rose-700">${formatCLP(item.precio)}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                trackCommerceEvent('regalo_checkout_upsell_add', {
                  idproducto: item.idproducto,
                  nombre: item.nombre_producto ?? item.nombre,
                });
                addWithFeedback({
                  idproducto: item.idproducto!,
                  nombre: item.nombre_producto ?? item.nombre,
                  precio_venta: toCLP(item.precio ?? 0),
                  imagen: item.imagen_url ?? null,
                  stock: 99,
                });
              }}
              className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
            >
              Sumar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
