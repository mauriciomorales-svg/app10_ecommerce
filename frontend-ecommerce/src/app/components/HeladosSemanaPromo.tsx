'use client';

import { useEffect, useState } from 'react';
import { Tag, ShoppingBag } from 'lucide-react';
import { toCLP } from '../lib/money';

type PromoData = {
  cupon?: string;
  descuento_clp?: number;
  mensaje?: string;
  texto_horario?: string;
  promo_activa?: boolean;
  combo?: {
    nombre?: string;
    descripcion_corta?: string;
    precio_desde?: number | null;
    imagen_url?: string | null;
    idproducto?: number | null;
  } | null;
};

export default function HeladosSemanaPromo({
  compact = false,
  onOrderCombo,
}: {
  compact?: boolean;
  onOrderCombo?: (productId: number, couponCode: string) => void;
}) {
  const [promo, setPromo] = useState<PromoData | null>(null);

  useEffect(() => {
    fetch('/api/tienda/experiencias-home')
      .then((r) => r.json())
      .then((d) => setPromo(d.helados_combos?.combo_semana ?? null))
      .catch(() => setPromo(null));
  }, []);

  if (!promo?.combo?.nombre) return null;

  const codigo = promo.cupon ?? 'COMBOSEMANA';
  const descuento = promo.descuento_clp ?? 500;
  const activa = Boolean(promo.promo_activa);
  const precio = promo.combo.precio_desde;
  const precioConDesc = precio != null ? Math.max(0, precio - descuento) : null;
  const productId = promo.combo.idproducto ?? null;
  const canOrder = Boolean(productId && onOrderCombo);

  const mensaje =
    promo.mensaje ??
    (activa
      ? `Te ahorras $${descuento.toLocaleString('es-CL')} si pides ahora`
      : `$${descuento.toLocaleString('es-CL')} menos lun–jue 15:00–17:00 hrs`);

  return (
    <div
      className={`overflow-hidden rounded-[1.35rem] shadow-premium ${
        activa
          ? 'border border-emerald-400/50 bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900'
          : 'border border-slate-200/80 bg-gradient-to-r from-slate-100 to-amber-50'
      } ${compact ? 'mx-0' : ''}`}
    >
      <div className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5 ${activa ? 'text-white' : 'text-brand-ink'}`}>
        {promo.combo.imagen_url && (
          <div className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-2xl ring-2 ring-white/20 sm:mx-0 sm:h-24 sm:w-24">
            <img
              src={promo.combo.imagen_url}
              alt={promo.combo.nombre ?? 'Combo de la semana'}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <p
            className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              activa ? 'bg-emerald-400/20 text-emerald-200' : 'bg-amber-200/80 text-amber-900'
            }`}
          >
            <Tag className="h-3 w-3" />
            Combo de la semana
          </p>
          <h3 className="font-display text-lg font-extrabold">{promo.combo.nombre}</h3>
          <p className={`mt-0.5 text-sm ${activa ? 'text-white/80' : 'text-brand-muted'}`}>{mensaje}</p>
          <p className={`mt-1 text-xs ${activa ? 'text-emerald-200' : 'text-amber-800'}`}>
            {promo.texto_horario ?? 'Lunes a jueves · 15:00 a 17:00 hrs'}
            {activa ? ' · Descuento activo ahora' : ' · Vuelve en el próximo horario'}
          </p>
          {precioConDesc != null && (
            <p className="mt-2 font-display text-xl font-extrabold">
              {activa ? (
                <>
                  <span className="text-emerald-300">{toCLP(precioConDesc)}</span>
                  <span className="ml-2 text-sm font-normal line-through opacity-60">{toCLP(precio)}</span>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-emerald-200/90">
                    Ahorras {toCLP(descuento)} hoy
                  </span>
                </>
              ) : (
                <>Desde {toCLP(precio)}</>
              )}
            </p>
          )}
        </div>

        {canOrder && (
          <div className="flex shrink-0 justify-center sm:justify-end">
            <button
              type="button"
              onClick={() => onOrderCombo!(productId!, codigo)}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold ${
                activa ? 'bg-white text-emerald-900 shadow-md' : 'bg-brand-ink text-white'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              {activa ? 'Aprovechar descuento' : 'Pedir combo'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
