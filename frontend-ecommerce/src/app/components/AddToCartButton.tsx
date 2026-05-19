'use client';

import { useCart } from '../context/CartContext';
import { Plus, ShoppingCart, Zap } from 'lucide-react';

interface AddToCartButtonProps {
  producto: {
    idproducto: number;
    nombre: string;
    precio_venta: number;
    categorias?: { idcategoria?: number; nombre: string }[];
    imagen_url?: string;
    stock: number;
    stock_disponible: number;
    es_pack?: boolean;
    has_bundle_options?: boolean;
  };
  onOpenBuilder?: () => void;
  compact?: boolean;
}

export default function AddToCartButton({ producto, onOpenBuilder, compact = false }: AddToCartButtonProps) {
  const { addToCart, items } = useCart();

  const inCart = items.find(i => i.idproducto === producto.idproducto);
  const quantity = inCart?.cantidad || 0;

  const stockReal = producto.stock_disponible ?? producto.stock;
  const idcategoria = producto.categorias?.[0]?.idcategoria ?? null;

  const necesitaBuilder = producto.es_pack || producto.has_bundle_options;

  const handleAdd = () => {
    if (necesitaBuilder && onOpenBuilder) {
      onOpenBuilder();
      return;
    }
    addToCart({
      idproducto: producto.idproducto,
      nombre: producto.nombre,
      precio_venta: producto.precio_venta,
      imagen: producto.imagen_url || null,
      stock: stockReal,
      idcategoria,
    });
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={stockReal <= 0}
        aria-label={necesitaBuilder ? 'Personalizar pack' : 'Agregar al carrito'}
        className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-transform active:scale-95 ${
          stockReal <= 0
            ? 'bg-gray-300 cursor-not-allowed'
            : quantity > 0
            ? 'bg-[#15803d] text-white ring-2 ring-white'
            : necesitaBuilder
            ? 'bg-amber-500 text-white'
            : 'bg-[#16a34a] text-white hover:bg-[#15803d]'
        }`}
      >
        {stockReal <= 0 ? (
          <ShoppingCart className="h-4 w-4 opacity-60" />
        ) : quantity > 0 ? (
          <span className="text-sm font-bold">{quantity}</span>
        ) : necesitaBuilder ? (
          <Zap className="h-4 w-4" />
        ) : (
          <Plus className="h-5 w-5 stroke-[2.5]" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={stockReal <= 0}
      className={`w-full py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium ${
        stockReal <= 0
          ? 'bg-gray-300 cursor-not-allowed'
          : quantity > 0
          ? 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20'
          : producto.es_pack
          ? 'bg-gradient-to-r from-[#16a34a] to-[#22c55e] hover:from-[#15803d] hover:to-[#16a34a] text-white shadow-md shadow-emerald-500/20'
          : 'bg-[#16a34a] hover:bg-[#15803d] text-white shadow-md shadow-emerald-500/20'
      }`}
    >
      {stockReal <= 0 ? (
        <ShoppingCart className="h-4 w-4" />
      ) : necesitaBuilder ? (
        <span>⚡</span>
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {stockReal <= 0
        ? 'Sin stock'
        : quantity > 0
        ? `En carrito (${quantity})`
        : necesitaBuilder
        ? '⚡ Personalizar'
        : 'Agregar al carrito'
      }
    </button>
  );
}

