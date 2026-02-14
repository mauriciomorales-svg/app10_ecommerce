'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton';
import ProductBuilderModal from './ProductBuilderModal';
import { useCart } from '../context/CartContext';

interface Producto {
  idproducto: number;
  nombre: string;
  precio_venta: number;
  stock: number;
  stock_disponible: number;
  es_pack?: boolean;
  has_bundle_options?: boolean;
  imagen_url?: string;
  categorias?: { nombre: string }[];
  componentes?: { idproducto: number; nombre: string; pivot: { cantidad: number } }[];
}

function formatPrice(price: number) {
  if (!price) return '$0';
  return '$' + Math.round(price).toLocaleString('es-CL');
}

export default function ProductGrid() {
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState<Producto[]>([]);
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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-[#d81b60] animate-spin mb-4" />
        <p className="text-gray-400 text-sm">Cargando productos...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1a2e]">
            {buscar ? (
              <>Resultados para <span className="text-[#d81b60]">&ldquo;{buscar}&rdquo;</span></>
            ) : 'Todos los productos'}
          </h2>
          <p className="text-gray-400 mt-1 text-sm">{total} productos encontrados</p>
        </div>
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No se encontraron productos</h3>
          <p className="text-gray-400 text-sm">Intenta con otra búsqueda o categoría</p>
          <Link href="/" className="btn-primary inline-block mt-6 text-sm">Ver todos los productos</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {productos.map((producto, index) => (
            <div
              key={producto.idproducto}
              className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-100 group animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative h-52 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                {producto.imagen_url ? (
                  <img src={producto.imagen_url} alt={producto.nombre} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex gap-1.5">
                  {producto.es_pack && producto.has_bundle_options && (
                    <span className="badge-category bg-gradient-to-r from-amber-500 to-orange-500 text-white">⚡ Personalizable</span>
                  )}
                  {producto.es_pack && !producto.has_bundle_options && (
                    <span className="badge-category bg-gradient-to-r from-blue-500 to-indigo-500 text-white">📦 Pack Armado</span>
                  )}
                  {producto.categorias?.[0]?.nombre && (
                    <span className="badge-category">{producto.categorias[0].nombre}</span>
                  )}
                </div>

                {producto.stock_disponible > 0 && producto.stock_disponible <= 5 && (
                  <div className="absolute top-3 right-3">
                    <span className="badge-stock bg-amber-100 text-amber-700">
                      {producto.es_pack ? `¡Solo ${producto.stock_disponible} packs!` : '¡Últimas unidades!'}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-[#1a1a2e] mb-3 line-clamp-2 min-h-[3rem] text-sm leading-snug">{producto.nombre}</h3>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-2xl font-black text-[#d81b60]">{formatPrice(producto.precio_venta)}</p>
                  </div>
                  <div className="text-right">
                    {producto.stock_disponible > 0 ? (
                      <span className="badge-stock bg-emerald-50 text-emerald-600">
                        {producto.stock_disponible} disponibles
                      </span>
                    ) : (
                      <span className="badge-stock bg-red-50 text-red-500">Agotado</span>
                    )}
                  </div>
                </div>

                <AddToCartButton producto={producto} onOpenBuilder={() => setBuilderProductId(producto.idproducto)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {builderProductId && (
        <ProductBuilderModal
          productId={builderProductId}
          onClose={() => setBuilderProductId(null)}
          onAddToCart={(item) => {
            // Add main pack
            addToCart({
              idproducto: item.idproducto,
              nombre: item.nombre,
              precio_venta: item.precio_venta,
              imagen: item.imagen || null,
              stock: 99,
              bundle_configuration: item.bundle_configuration,
            });
            // Add selected suggestions
            if (item.bundle_configuration?.suggestions) {
              item.bundle_configuration.suggestions.forEach((suggestion) => {
                if (suggestion) {
                  addToCart({
                    idproducto: suggestion.idproducto,
                    nombre: suggestion.nombre,
                    precio_venta: suggestion.precio_venta,
                    imagen: suggestion.imagen_url || null,
                    stock: 99,
                  });
                }
              });
            }
          }}
        />
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={page <= 1}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white border border-pink-200 text-[#d81b60] hover:bg-pink-50"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <span className="text-sm text-gray-500 font-medium">
            P&aacute;gina {page} de {lastPage}
          </span>
          <button
            onClick={() => { setPage(p => Math.min(lastPage, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={page >= lastPage}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-[#d81b60] text-white hover:bg-[#ad1457]"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
}
