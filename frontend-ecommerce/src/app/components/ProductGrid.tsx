'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard, { ProductCardItem } from './ProductCard';
import ProductBuilderModal from './ProductBuilderModal';
import SearchEmptyState from './SearchEmptyState';
import { useCartFeedback } from '../hooks/useCartFeedback';
import { resolveCartStock } from '../lib/cartHelpers';
import { getCommerceSessionId } from '../lib/commerceEvents';
import type { SearchScope } from '../lib/searchScope';
import { SEARCH_SCOPE_META } from '../lib/searchScope';
import { useRouter } from 'next/navigation';

type ProductGridProps = {
  /** Fija categoría sin depender de ?categoria= en la URL (p. ej. página /helados) */
  categoriaOverride?: string;
  /** En /helados: solo padres TOPPI-PARENT/COMBO/YOGEN (no sabores sueltos) */
  soloExperiencia?: boolean;
  /** Búsqueda fija (p. ej. guía porciones en /salada) */
  buscarOverride?: string;
  /** Alcance experiencia: regalos | salada | helados | packs */
  alcanceOverride?: string;
  searchScope?: SearchScope;
};

export default function ProductGrid({
  categoriaOverride,
  soloExperiencia = false,
  buscarOverride,
  alcanceOverride,
  searchScope = 'home',
}: ProductGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState<ProductCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [builderProductId, setBuilderProductId] = useState<number | null>(null);
  const { addWithFeedback } = useCartFeedback();

  const buscar =
    buscarOverride ?? (searchParams.get('buscar') || searchParams.get('q') || '');
  const categoria = categoriaOverride ?? searchParams.get('categoria') ?? '';
  const orden = searchParams.get('orden') || '';

  useEffect(() => {
    setPage(1);
  }, [buscar, categoria, orden]);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/productos?page=${page}`;
      if (buscar) url += `&buscar=${encodeURIComponent(buscar)}`;
      if (categoria) url += `&categoria=${categoria}`;
      if (alcanceOverride) url += `&alcance=${encodeURIComponent(alcanceOverride)}`;
      if (soloExperiencia) url += '&experiencia=1';
      if (orden) url += `&orden=${orden}`;
      if (buscar) {
        url += `&session_id=${encodeURIComponent(getCommerceSessionId())}`;
        if (typeof window !== 'undefined') {
          url += `&page_path=${encodeURIComponent(window.location.pathname)}`;
        }
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Error');
      const data = await res.json();
      setProductos(data.data || []);
      setTotal(data.total || 0);
      setLastPage(data.last_page || 1);
    } catch (e) {
      console.error('Error fetching productos:', e);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [buscar, categoria, orden, page, soloExperiencia, alcanceOverride]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 text-brand-primary animate-spin mb-3" />
        <p className="text-gray-400 text-sm">Cargando productos...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">
          {buscar ? (
            <>
              Resultados para <span className="font-semibold text-brand-primary">&ldquo;{buscar}&rdquo;</span>
            </>
          ) : (
            'Catálogo'
          )}
          {' · '}
          <span className="font-medium text-gray-700">{total}</span> productos
        </p>
      </div>

      {productos.length === 0 ? (
        <SearchEmptyState
          query={buscar}
          scope={searchScope}
          onTryTerm={
            buscar
              ? (term) => {
                  const meta = SEARCH_SCOPE_META[searchScope];
                  router.push(
                    `${meta.targetPath}?buscar=${encodeURIComponent(term)}#${meta.hash}`,
                  );
                }
              : undefined
          }
        />
      ) : (
        <div className="retail-shelf">
          {productos.map((producto) => (
            <ProductCard
              key={producto.idproducto}
              producto={producto}
              onOpenBuilder={() => setBuilderProductId(producto.idproducto)}
            />
          ))}
        </div>
      )}

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

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            disabled={page <= 1}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-30 bg-white border border-slate-200 text-brand-primary"
          >
            <ChevronLeft className="h-4 w-4" /> Ant.
          </button>
          <span className="text-xs text-gray-500 font-medium">
            {page} / {lastPage}
          </span>
          <button
            type="button"
            onClick={() => {
              setPage((p) => Math.min(lastPage, p + 1));
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            disabled={page >= lastPage}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-30 bg-brand-primary text-white"
          >
            Sig. <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
