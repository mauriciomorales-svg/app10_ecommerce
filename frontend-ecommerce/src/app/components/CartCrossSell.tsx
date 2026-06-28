'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCommerceStore } from '../context/CommerceStoreContext';
import { formatCLP, toCLP } from '../lib/money';
import { trackCommerceEvent } from '../lib/commerceEvents';

export interface CrossSellProduct {
  idproducto: number;
  nombre: string;
  precio_venta?: number;
  precio?: number;
  imagen_url?: string;
  stock_actual?: number;
  stock_disponible?: number;
  stock?: number;
  es_pack?: boolean;
  has_bundle_options?: boolean;
  has_customization?: boolean;
  mensaje?: string;
  tipo?: string;
  ahorro_pack_clp?: number;
}

interface CartCrossSellProps {
  cartProductIds: number[];
  compact?: boolean;
  maxItems?: number;
  title?: string;
}

export default function CartCrossSell({
  cartProductIds,
  compact = false,
  maxItems,
  title = 'Completa tu pedido',
}: CartCrossSellProps) {
  const { addToCart, items } = useCart();
  const { isJobshours } = useCommerceStore();
  const [suggestions, setSuggestions] = useState<CrossSellProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const idsKey = useMemo(
    () => [...cartProductIds].sort((a, b) => a - b).join(','),
    [cartProductIds],
  );

  useEffect(() => {
    if (cartProductIds.length === 0) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('/api/checkout/cart-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_ids: cartProductIds }),
    })
      .then((r) => r.json())
      .then((data) => {
        let list = Array.isArray(data.suggestions) ? data.suggestions : [];
        list = list.filter((p: CrossSellProduct) => {
          const precio = toCLP(p.precio_venta ?? p.precio ?? 0);
          if (precio <= 100) return false;
          if (isJobshours && precio < 15000) return false;
          if (isJobshours && !p.imagen_url) return false;
          return true;
        });
        if (maxItems && maxItems > 0) {
          list = list.slice(0, maxItems);
        }
        setSuggestions(list);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, [idsKey, maxItems, isJobshours]);

  if (isJobshours) {
    return null;
  }

  if (loading) {
    return (
      <div
        className={`bg-white rounded-2xl border border-slate-100 animate-pulse ${
          compact ? 'h-24 p-3' : 'h-32 p-5'
        }`}
      />
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const handleAdd = (p: CrossSellProduct) => {
    const stock = p.stock_disponible ?? p.stock_actual ?? p.stock ?? 0;
    trackCommerceEvent('cross_sell_add', {
      idproducto: p.idproducto,
      tipo: p.tipo,
      compact,
    });
    if (p.es_pack || p.has_bundle_options || p.has_customization) {
      window.location.href = `/producto/${p.idproducto}`;
      return;
    }
    addToCart({
      idproducto: p.idproducto,
      nombre: p.nombre,
      precio_venta: toCLP(p.precio_venta ?? p.precio ?? 0),
      imagen: p.imagen_url || null,
      stock,
    });
  };

  return (
    <section
      className={`bg-white rounded-2xl shadow-card border border-slate-100 ${
        compact ? 'p-3' : 'p-5'
      }`}
    >
      <h2
        className={`font-display font-bold text-brand-ink flex items-center gap-2 ${
          compact ? 'text-sm mb-2' : 'text-lg mb-1'
        }`}
      >
        <Sparkles className={`text-brand-accent ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
        {title}
      </h2>
      {!compact && (
        <p className="text-sm text-brand-muted mb-4">Sugerencias según lo que llevas en el carrito</p>
      )}
      <div
        className={
          compact
            ? 'flex gap-2 overflow-x-auto pb-1 snap-x'
            : 'grid sm:grid-cols-2 gap-3'
        }
      >
        {suggestions.map((p) => {
          const precio = toCLP(p.precio_venta ?? p.precio ?? 0);
          const inCart = items.some((i) => i.idproducto === p.idproducto);
          const stock = p.stock_disponible ?? p.stock_actual ?? p.stock ?? 0;

          return (
            <div
              key={p.idproducto}
              className={`flex gap-2 rounded-xl border border-slate-100 bg-brand-surface/50 hover:border-brand-primary/30 transition-colors ${
                compact ? 'min-w-[220px] snap-start p-2 shrink-0' : 'gap-3 p-3'
              }`}
            >
              <Link
                href={`/producto/${p.idproducto}`}
                className={`relative shrink-0 rounded-lg overflow-hidden bg-slate-100 ${
                  compact ? 'w-12 h-12' : 'w-16 h-16'
                }`}
                onClick={() =>
                  trackCommerceEvent('cross_sell_click', { idproducto: p.idproducto })
                }
              >
                {p.imagen_url ? (
                  <Image
                    src={p.imagen_url}
                    alt={p.nombre}
                    fill
                    className="object-contain p-1"
                    sizes={compact ? '48px' : '64px'}
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 flex items-center justify-center h-full">
                    Sin foto
                  </span>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                {p.mensaje && !compact && (
                  <p className="text-[10px] font-semibold text-brand-accent uppercase tracking-wide mb-0.5 line-clamp-1">
                    {p.mensaje}
                  </p>
                )}
                <Link
                  href={`/producto/${p.idproducto}`}
                  className={`font-medium text-brand-ink hover:text-brand-primary line-clamp-2 ${
                    compact ? 'text-xs' : 'text-sm'
                  }`}
                >
                  {p.nombre}
                </Link>
                <p className={`font-bold text-brand-primary tabular-nums ${compact ? 'text-xs' : 'text-sm'}`}>
                  ${formatCLP(precio)}
                </p>
                {p.ahorro_pack_clp && p.ahorro_pack_clp > 0 && (
                  <p className="text-[10px] text-brand-success font-semibold">
                    Ahorra ${formatCLP(p.ahorro_pack_clp)} vs por separado
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleAdd(p)}
                  disabled={stock <= 0 || inCart}
                  className={`inline-flex items-center gap-1 font-bold text-white bg-brand-primary rounded-lg disabled:opacity-50 hover:bg-brand-primary-hover ${
                    compact ? 'mt-1 text-[10px] px-2 py-1' : 'mt-2 text-xs px-3 py-1.5'
                  }`}
                >
                  <Plus className="h-3 w-3" />
                  {inCart ? 'En carrito' : p.has_bundle_options ? 'Personalizar' : 'Agregar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
