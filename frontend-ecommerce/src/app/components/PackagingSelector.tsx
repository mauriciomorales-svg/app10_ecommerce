'use client';

import { formatCLP } from '../lib/money';
import type { PackagingOption } from '../lib/checkout';

type Props = {
  options: PackagingOption[];
  selected: string;
  onSelect: (key: string) => void;
  amountToFreeReinforced: number;
  amountToFreeGiftBox?: number;
  freeReinforcedFrom?: number;
  freeGiftBoxFrom?: number;
};

export default function PackagingSelector({
  options,
  selected,
  onSelect,
  amountToFreeReinforced,
  amountToFreeGiftBox = 0,
  freeReinforcedFrom = 10000,
  freeGiftBoxFrom = 25000,
}: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-brand-ink">Como empacamos tu pedido?</h2>
        <p className="text-sm text-gray-500 mt-1">
          El empaque protege tus productos y ayuda a armar tu pedido mas rapido en tienda.
        </p>
      </div>

      {amountToFreeReinforced > 0 && amountToFreeReinforced <= 8000 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          Te faltan <strong>${formatCLP(amountToFreeReinforced)}</strong> en productos para bolsa reforzada gratis (desde $
          {formatCLP(freeReinforcedFrom)}).
        </div>
      )}
      {amountToFreeGiftBox > 0 && amountToFreeGiftBox <= 12000 && (
        <div className="rounded-xl bg-brand-primary/5 border border-brand-primary/20 px-4 py-3 text-sm text-brand-ink">
          A <strong>${formatCLP(freeGiftBoxFrom)}</strong> en productos la <strong>caja regalo</strong> puede salir gratis si la
          eliges.
        </div>
      )}

      <div className="grid gap-2">
        {options.map((opt) => (
          <label
            key={opt.key}
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              selected === opt.key
                ? 'border-brand-primary bg-[#ecfdf5] ring-2 ring-brand-primary/20'
                : 'border-emerald-100 hover:border-emerald-200'
            }`}
          >
            <input
              type="radio"
              name="packaging"
              value={opt.key}
              checked={selected === opt.key}
              onChange={() => onSelect(opt.key)}
              className="mt-1 accent-brand-primary"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2 items-start">
                <span className="font-semibold text-brand-ink">
                  {opt.label}
                  {opt.recommended ? (
                    <span className="ml-2 text-[10px] uppercase bg-brand-primary text-white px-2 py-0.5 rounded-full">
                      Recomendado
                    </span>
                  ) : null}
                </span>
                <span className="font-bold text-brand-primary shrink-0">
                  {opt.amount === 0 ? 'Gratis' : `+$${formatCLP(opt.amount)}`}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
              {opt.free_applied && opt.base_amount > 0 ? (
                <p className="text-xs text-green-700 mt-1 font-medium">Incluido en tu compra</p>
              ) : null}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}



