'use client';

import { Package } from 'lucide-react';

export type PackComponentePreview = {
  idproducto: number;
  nombre: string;
  cantidad?: number;
  imagen_url?: string | null;
};

type Props = {
  items?: PackComponentePreview[];
  variant?: 'dark' | 'light';
  max?: number;
  label?: string;
};

/** Vista compacta de componentes — sin fotos (evita mezcla de estilos en tarjetas). */
export default function PackComponentesPreview({
  items = [],
  variant = 'dark',
  max = 5,
  label = 'Productos del pack',
}: Props) {
  const visible = items.slice(0, max);
  if (visible.length === 0) return null;

  const isDark = variant === 'dark';
  const pillBase = isDark
    ? 'bg-white/[0.06] text-white/80 ring-white/12'
    : 'bg-rose-50/90 text-brand-ink ring-rose-100';
  const iconCls = isDark ? 'text-amber-300/85' : 'text-brand-primary';
  const moreCls = isDark ? 'text-white/45' : 'text-brand-muted';

  return (
    <div className="mt-2">
      <p
        className={`mb-1.5 text-[9px] font-bold uppercase tracking-wider ${
          isDark ? 'text-white/45' : 'text-brand-muted'
        }`}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1">
        {visible.map((item) => {
          const qty = item.cantidad && item.cantidad > 1 ? ` ×${item.cantidad}` : '';
          const title = `${item.nombre}${qty}`;

          return (
            <span
              key={item.idproducto}
              title={title}
              className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium ring-1 ${pillBase}`}
            >
              <Package className={`h-3 w-3 shrink-0 ${iconCls}`} aria-hidden />
              <span className="truncate">{item.nombre}</span>
              {item.cantidad != null && item.cantidad > 1 && (
                <span className={`shrink-0 font-bold ${isDark ? 'text-amber-200/90' : 'text-brand-primary'}`}>
                  ×{item.cantidad}
                </span>
              )}
            </span>
          );
        })}
        {items.length > max && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold ${moreCls}`}>
            +{items.length - max}
          </span>
        )}
      </div>
    </div>
  );
}
