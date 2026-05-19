'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ProductCard, { ProductCardItem } from './ProductCard';
import ProductBuilderModal from './ProductBuilderModal';
import { useCart } from '../context/CartContext';

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState<ProductCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [builderProductId, setBuilderProductId] = useState<number | null>(null);
  const { addToCart } = useCart();

  const buscar = searchParams.get('buscar') || '';
  const categoria = searchParams.get('categoria') || '';
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
      if (orden) url += `&orden=${orden}`;

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
  }, [buscar, categoria, orden, page]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 text-[#16a34a] animate-spin mb-3" />
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
              Resultados para <span className="font-semibold text-[#16a34a]">&ldquo;{buscar}&rdquo;</span>
            </>
          ) : (
            'Catálogo'
          )}
          {' · '}
          <span className="font-medium text-gray-700">{total}</span> productos
        </p>
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <Search className="h-12 w-12 text-gray-200 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-500 mb-1">No hay productos</h3>
          <p className="text-gray-400 text-sm mb-4">Prueba otra búsqueda o categoría</p>
          <Link href="/" className="btn-primary inline-block text-sm py-2 px-4">
            Ver todo
          </Link>
        </div>
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

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
            }}
            disabled={page <= 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-30 bg-white border border-gray-200 text-[#16a34a]"
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
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-30 bg-[#16a34a] text-white"
          >
            Sig. <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
