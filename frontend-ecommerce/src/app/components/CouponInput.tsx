'use client';

import { useState } from 'react';
import { Tag, X, Loader2 } from 'lucide-react';
import { formatCLP } from '../lib/money';
import { trackCommerceEvent } from '../lib/commerceEvents';

export type AppliedCoupon = {
  codigo: string;
  discount: number;
  label: string;
};

type Props = {
  subtotal: number;
  applied: AppliedCoupon | null;
  onApply: (coupon: AppliedCoupon | null) => void;
  email?: string;
  telefono?: string;
  hint?: string;
};

export default function CouponInput({
  subtotal,
  applied,
  onApply,
  email,
  telefono,
  hint,
}: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = async (codigo?: string) => {
    const trimmed = (codigo ?? code).trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: trimmed,
          subtotal,
          email: email || undefined,
          telefono: telefono || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Cupón no válido');
        onApply(null);
        return;
      }
      onApply({
        codigo: data.codigo,
        discount: data.discount,
        label: data.label,
      });
      trackCommerceEvent('coupon_applied', {
        codigo: data.codigo,
        discount: data.discount,
        subtotal,
      });
      setCode('');
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    onApply(null);
    setError('');
  };

  if (applied) {
    return (
      <div className="rounded-xl border border-brand-success/30 bg-brand-success/5 p-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-primary flex items-center gap-1">
            <Tag className="h-4 w-4" />
            {applied.label}
          </p>
          <p className="text-xs text-brand-muted mt-0.5">
            Código {applied.codigo} — ahorras ${formatCLP(applied.discount)}
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="p-1.5 text-brand-muted hover:text-red-600 rounded-lg"
          aria-label="Quitar cupón"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-2">
      <p className="text-sm font-semibold text-brand-ink flex items-center gap-1">
        <Tag className="h-4 w-4 text-brand-accent" />
        ¿Tienes un cupón?
      </p>
      {hint && <p className="text-xs text-brand-muted">{hint}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ej: BIENVENIDO10"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm uppercase focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 outline-none"
        />
        <button
          type="button"
          onClick={() => validate()}
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl disabled:opacity-50 hover:bg-brand-primary-hover"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Aplicar'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/** Revalida cupón aplicado (p. ej. al cambiar subtotal). */
export async function revalidateCoupon(
  coupon: AppliedCoupon,
  subtotal: number,
  email?: string,
  telefono?: string,
): Promise<{ ok: true; coupon: AppliedCoupon } | { ok: false; message: string }> {
  try {
    const res = await fetch('/api/checkout/coupon/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: coupon.codigo,
        subtotal,
        email: email || undefined,
        telefono: telefono || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { ok: false, message: data.message || 'Cupón ya no aplica' };
    }
    return {
      ok: true,
      coupon: {
        codigo: data.codigo,
        discount: data.discount,
        label: data.label,
      },
    };
  } catch {
    return { ok: false, message: 'Error de conexión' };
  }
}
