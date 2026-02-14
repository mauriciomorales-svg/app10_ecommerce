'use client';

import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface AddToCartButtonProps {
  producto: {
    idproducto: number;
    nombre: string;
    precio_venta: number;
    imagen_url?: string;
    stock: number;
    stock_disponible: number;
    es_pack?: boolean;
    has_bundle_options?: boolean;
  };
  onOpenBuilder?: () => void;
}

export default function AddToCartButton({ producto, onOpenBuilder }: AddToCartButtonProps) {
  const { addToCart, items } = useCart();

  const inCart = items.find(i => i.idproducto === producto.idproducto);
  const quantity = inCart?.cantidad || 0;

  const stockReal = producto.stock_disponible ?? producto.stock;

  const handleAdd = () => {
    if (producto.es_pack && onOpenBuilder) {
      onOpenBuilder();
      return;
    }
    addToCart({
      idproducto: producto.idproducto,
      nombre: producto.nombre,
      precio_venta: producto.precio_venta,
      imagen: producto.imagen_url || null,
      stock: stockReal,
    });
  };

  return (
    <button
      onClick={handleAdd}
      disabled={stockReal <= 0}
      className={`w-full py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium ${
        stockReal <= 0
          ? 'bg-gray-300 cursor-not-allowed'
          : quantity > 0
          ? 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20'
          : producto.es_pack
          ? 'bg-gradient-to-r from-[#d81b60] to-[#ff6090] hover:from-[#ad1457] hover:to-[#d81b60] text-white shadow-md shadow-pink-500/20'
          : 'bg-[#d81b60] hover:bg-[#ad1457] text-white shadow-md shadow-pink-500/20'
      }`}
    >
      {stockReal <= 0 ? (
        <ShoppingCart className="h-4 w-4" />
      ) : producto.es_pack && producto.has_bundle_options ? (
        <span>⚡</span>
      ) : producto.es_pack ? (
        <span>📦</span>
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {stockReal <= 0 
        ? 'Sin stock' 
        : quantity > 0 
        ? `En carrito (${quantity})` 
        : producto.es_pack && producto.has_bundle_options
        ? '⚡ Personalizar'
        : producto.es_pack
        ? '📦 Agregar pack'
        : 'Agregar al carrito'
      }
    </button>
  );
}
