'use client';

import { useEffect, useState } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import ProductCard, { ProductCardItem } from './ProductCard';
import ProductBuilderModal from './ProductBuilderModal';
import { useCart } from '../context/CartContext';
import { toCLP } from '../lib/money';

export default function FeaturedProductsRow() {
  const [products, setProducts] = useState<ProductCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [builderProductId, setBuilderProductId] = useState<number | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/productos/destacados')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProducts(
          list.map((p: Record<string, unknown>) => ({
            idproducto: p.idproducto as number,
            nombre: p.nombre as string,
            precio_venta: toCLP((p.precio_venta ?? p.precio ?? 0) as number),
            stock: (p.stock ?? p.stock_actual ?? 0) as number,
            stock_disponible: (p.stock_disponible ?? p.stock_actual ?? 0) as number,
            es_pack: Boolean(p.es_pack),
            has_bundle_options: Boolean(p.has_bundle_options),
            imagen_url: p.imagen_url as string | undefined,
            categorias: p.categorias as ProductCardItem['categorias'],
          }))
        );
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 text-[#16a34a] animate-spin" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[#1a1a2e] flex items-center gap-2">
          <Flame className="h-5 w-5 text-amber-500" />
          Lo más vendido
        </h2>
        <a href="#catalogo" className="text-xs font-semibold text-[#16a34a] hover:underline">
          Ver todo
        </a>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
        {products.map((p) => (
          <div key={p.idproducto} className="w-[140px] sm:w-[155px] shrink-0 snap-start">
            <ProductCard
              producto={p}
              onOpenBuilder={() => setBuilderProductId(p.idproducto)}
            />
          </div>
        ))}
      </div>

      {builderProductId && (
        <ProductBuilderModal
          productId={builderProductId}
          onClose={() => setBuilderProductId(null)}
          onAddToCart={(item) => {
            addToCart({
              idproducto: item.idproducto,
              nombre: item.nombre,
              precio_venta: item.precio_venta,
              imagen: item.imagen || null,
              stock: 99,
              bundle_configuration: item.bundle_configuration,
              idcategoria: item.idcategoria ?? null,
            });
          }}
        />
      )}
    </section>
  );
}
