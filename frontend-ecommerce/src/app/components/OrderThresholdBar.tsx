'use client';

import { formatCLP } from '../lib/money';

type Props = {
  subtotal: number;
  freeReinforcedFrom: number;
  freeGiftBoxFrom: number;
  compact?: boolean;
  minOrderProducts?: number;
};

function ProgressChip({
  label,
  remaining,
  target,
  subtotal,
  compact,
}: {
  label: string;
  remaining: number;
  target: number;
  subtotal: number;
  compact?: boolean;
}) {
  const progress = Math.min(100, Math.round((subtotal / target) * 100));

  return (
    <div className={compact ? 'space-y-1' : 'space-y-1.5'}>
      <p className={`text-amber-900 ${compact ? 'text-[11px]' : 'text-xs'}`}>
        {remaining > 0 ? (
          <>
            Faltan <strong>${formatCLP(remaining)}</strong> para <strong>{label}</strong>
          </>
        ) : (
          <strong className="text-brand-primary">✓ {label}</strong>
        )}
      </p>
      <div className="h-1.5 rounded-full bg-amber-200/80 overflow-hidden">
        <div
          className="h-full bg-brand-accent rounded-full transition-all duration-500"
          style={{ width: `${remaining > 0 ? progress : 100}%` }}
        />
      </div>
    </div>
  );
}

export default function OrderThresholdBar({
  subtotal,
  freeReinforcedFrom,
  freeGiftBoxFrom,
  compact = false,
  minOrderProducts = 0,
}: Props) {
  const toReinforced = Math.max(0, freeReinforcedFrom - subtotal);
  const toGift = Math.max(0, freeGiftBoxFrom - subtotal);
  const belowMin = minOrderProducts > 0 && subtotal > 0 && subtotal < minOrderProducts;

  if (toReinforced <= 0 && toGift <= 0) {
    return (
      <div className="rounded-xl bg-brand-success/10 border border-brand-success/30 px-4 py-3 text-sm text-brand-primary space-y-1">
        <p>
          <strong>¡Genial!</strong> Tienes bolsa reforzada y caja regalo sin costo en checkout.
        </p>
        {belowMin && (
          <p className="text-xs text-amber-800">
            Pedido mínimo web: ${formatCLP(minOrderProducts)} en productos (te faltan $
            {formatCLP(minOrderProducts - subtotal)}).
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-amber-200 bg-amber-50 ${
        compact ? 'px-3 py-2.5' : 'px-4 py-3'
      } space-y-3`}
    >
      {belowMin && (
        <p className={`text-amber-900 ${compact ? 'text-[11px]' : 'text-xs'}`}>
          Pedido mínimo: <strong>${formatCLP(minOrderProducts)}</strong> en productos (faltan $
          {formatCLP(minOrderProducts - subtotal)}).
        </p>
      )}
      <ProgressChip
        label="bolsa reforzada gratis"
        remaining={toReinforced}
        target={freeReinforcedFrom}
        subtotal={subtotal}
        compact={compact}
      />
      <ProgressChip
        label="caja regalo gratis"
        remaining={toGift}
        target={freeGiftBoxFrom}
        subtotal={subtotal}
        compact={compact}
      />
    </div>
  );
}
