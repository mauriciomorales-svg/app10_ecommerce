'use client';

import type { CartItem } from '../context/CartContext';
import { resolveCartLineIncludes } from '../lib/packIncludes';

type CartPackContentsProps = {
  item: CartItem;
  /** En checkout/resumen lateral */
  compact?: boolean;
  maxItems?: number;
};

export default function CartPackContents({
  item,
  compact = false,
  maxItems,
}: CartPackContentsProps) {
  const lines = resolveCartLineIncludes(item);
  if (lines.length === 0) return null;

  const limit = maxItems ?? (compact ? 4 : 12);
  const visible = lines.slice(0, limit);
  const rest = lines.length - visible.length;

  return (
    <div
      className={
        compact
          ? 'mt-1 text-[11px] text-gray-600'
          : 'mt-2 rounded-xl bg-emerald-50/90 px-3 py-2 ring-1 ring-emerald-100/80'
      }
    >
      {!compact && (
        <p className="text-[10px] font-bold uppercase tracking-wide text-brand-primary">
          Contenido del pack
        </p>
      )}
      {compact && (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary/80">
          Incluye
        </p>
      )}
      <ul
        className={
          compact
            ? 'mt-0.5 list-inside list-disc space-y-0.5 leading-snug'
            : 'mt-1 space-y-0.5 text-xs leading-relaxed text-brand-ink/90'
        }
      >
        {visible.map((line) => (
          <li key={line} className={compact ? '' : 'flex gap-1.5 before:content-["·"] before:font-bold before:text-brand-primary'}>
            {line}
          </li>
        ))}
        {rest > 0 && (
          <li className="text-gray-500 italic">
            +{rest} ítem{rest > 1 ? 's' : ''} más
          </li>
        )}
      </ul>
    </div>
  );
}
