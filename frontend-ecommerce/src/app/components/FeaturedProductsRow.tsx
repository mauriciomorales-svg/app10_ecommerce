'use client';

import { useEffect, useState } from 'react';
import { Flame, Loader2 } from 'lucide-react';
import ProductCard, { ProductCardItem } from './ProductCard';
import ProductBuilderModal from './ProductBuilderModal';
import { useCartFeedback } from '../hooks/useCartFeedback';
import ExperienceSectionFallback from './ExperienceSectionFallback';
import { resolveCartStock } from '../lib/cartHelpers';
import { toCLP } from '../lib/money';

export default function FeaturedProductsRow() {
  const [products, setProducts] = useState<ProductCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [builderProductId, setBuilderProductId] = useState<number | null>(null);
  const { addWithFeedback } = useCartFeedback();

  const loadData = () => {
    setLoading(true);
    setFetchError(false);
    fetch('/api/productos/destacados')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
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
            has_customization: Boolean(p.has_customization),
            imagen_url: p.imagen_url as string | undefined,
            categorias: p.categorias as ProductCardItem['categorias'],
          })),
        );
      })
      .catch(() => {
        setProducts([]);
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || fetchError || products.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
        <ExperienceSectionFallback
          loading={loading}
          error={fetchError}
          empty={!loading && !fetchError && products.length === 0}
          emptyMessage="Los destacados se actualizarán pronto."
          onRetry={loadData}
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <span className="premium-kicker mb-1 block">Tendencia en Renaico</span>
          <h2 className="font-display flex items-center gap-2 text-lg font-extrabold text-brand-ink sm:text-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-accent/25 to-amber-100 shadow-inner-soft">
              <Flame className="h-4 w-4 text-brand-accent" />
            </span>
            Lo más vendido
          </h2>
        </div>
        <a
          href="#catalogo"
          className="shrink-0 rounded-full border border-brand-primary/20 bg-white/80 px-3 py-1.5 text-xs font-bold text-brand-primary shadow-sm transition hover:border-brand-primary hover:shadow-md"
        >
          Ver todo →
        </a>
      </div>
      <div className="premium-scroll-fade -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
        {products.map((p) => (
          <div key={p.idproducto} className="w-[min(42vw,180px)] sm:w-[200px] shrink-0 snap-start">
            <ProductCard producto={p} onOpenBuilder={() => setBuilderProductId(p.idproducto)} />
          </div>
        ))}
      </div>

      {builderProductId && (
        <ProductBuilderModal
          productId={builderProductId}
          onClose={() => setBuilderProductId(null)}
          onAddToCart={(item) => {
            addWithFeedback({
              idproducto: item.idproducto,
              nombre: item.nombre,
              precio_venta: item.precio_venta,
              imagen: item.imagen || null,
              stock: resolveCartStock(1, item.bundle_configuration),
              pack_includes: item.pack_includes,
              bundle_configuration: item.bundle_configuration,
              idcategoria: item.idcategoria ?? null,
            });
            setBuilderProductId(null);
          }}
        />
      )}
    </section>
  );
}
