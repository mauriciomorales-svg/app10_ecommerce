'use client';

import { Package } from 'lucide-react';
import AddToCartButton from './AddToCartButton';

export interface ProductCardItem {
  idproducto: number;
  nombre: string;
  precio_venta: number;
  stock: number;
  stock_disponible: number;
  es_pack?: boolean;
  has_bundle_options?: boolean;
  imagen_url?: string;
  categorias?: { idcategoria?: number; nombre: string }[];
}

interface ProductCardProps {
  producto: ProductCardItem;
  onOpenBuilder?: () => void;
}

function formatPrice(price: number) {
  if (!price) return '$0';
  return '$' + Math.round(price).toLocaleString('es-CL');
}

export default function ProductCard({ producto, onOpenBuilder }: ProductCardProps) {
  const stock = producto.stock_disponible ?? producto.stock;
  const isPack = producto.es_pack || producto.has_bundle_options;

  return (
    <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-emerald-300 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="product-thumb">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <Package className="h-8 w-8 text-gray-300" />
          </div>
        )}

        {isPack && (
          <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            PACK
          </span>
        )}

        {stock > 0 && stock <= 5 && (
          <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            Últimas
          </span>
        )}

        <div className="absolute bottom-1.5 right-1.5">
          <AddToCartButton producto={producto} onOpenBuilder={onOpenBuilder} compact />
        </div>
      </div>

      <div className="p-2 flex-1 flex flex-col">
        <p className="text-sm font-black text-[#16a34a] tabular-nums leading-none mb-1">
          {formatPrice(producto.precio_venta)}
        </p>
        <h3 className="text-[11px] sm:text-xs text-gray-800 line-clamp-2 leading-snug flex-1">
          {producto.nombre}
        </h3>
        {stock <= 0 && (
          <p className="text-[10px] text-red-500 font-semibold mt-1">Agotado</p>
        )}
      </div>
    </article>
  );
}
