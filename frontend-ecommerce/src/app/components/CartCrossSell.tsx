'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCLP, toCLP } from '../lib/money';

interface DestacadoProduct {
  idproducto: number;
  nombre: string;
  precio_venta?: number;
  precio?: number;
  imagen_url?: string;
  stock_actual?: number;
  stock_disponible?: number;
  es_pack?: boolean;
  has_bundle_options?: boolean;
}

interface CartCrossSellProps {
  cartProductIds: number[];
}

export default function CartCrossSell({ cartProductIds }: CartCrossSellProps) {
  const { addToCart, items } = useCart();
  const [products, setProducts] = useState<DestacadoProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/productos/destacados')
      .then((r) => r.json())
      .then((data: DestacadoProduct[]) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const suggestions = useMemo(() => {
    const inCart = new Set(cartProductIds);
    return products.filter((p) => !inCart.has(p.idproducto)).slice(0, 4);
  }, [products, cartProductIds]);

  if (loading || suggestions.length === 0) {
    return null;
  }

  const handleAdd = (p: DestacadoProduct) => {
    const stock = p.stock_disponible ?? p.stock_actual ?? 0;
    if (p.es_pack || p.has_bundle_options) {
      window.location.href = '/';
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
    <section className="bg-white rounded-2xl shadow-md border border-emerald-50 p-5">
      <h2 className="text-lg font-bold text-[#1a1a2e] mb-1 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[#16a34a]" />
        Completa tu pedido
      </h2>
      <p className="text-sm text-gray-500 mb-4">Los más vendidos que otros clientes agregan al carrito</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {suggestions.map((p) => {
          const precio = toCLP(p.precio_venta ?? p.precio ?? 0);
          const inCart = items.some((i) => i.idproducto === p.idproducto);
          const stock = p.stock_disponible ?? p.stock_actual ?? 0;

          return (
            <div
              key={p.idproducto}
              className="flex gap-3 p-3 rounded-xl border border-emerald-100 bg-[#fffafb] hover:border-emerald-200 transition-colors"
            >
              <Link
                href="/"
                className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100"
              >
                {p.imagen_url ? (
                  <Image src={p.imagen_url} alt={p.nombre} fill className="object-contain p-1" sizes="64px" />
                ) : (
                  <span className="text-xs text-gray-400 flex items-center justify-center h-full">Sin foto</span>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1a1a2e] truncate">{p.nombre}</p>
                <p className="text-sm font-bold text-[#16a34a]">${formatCLP(precio)}</p>
                <button
                  type="button"
                  onClick={() => handleAdd(p)}
                  disabled={stock <= 0 || inCart}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white bg-[#16a34a] px-3 py-1.5 rounded-lg disabled:opacity-50 hover:bg-[#15803d]"
                >
                  <Plus className="h-3 w-3" />
                  {inCart ? 'En carrito' : 'Agregar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

