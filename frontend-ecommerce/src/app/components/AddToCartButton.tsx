'use client';

import { useCart } from '../context/CartContext';
import { useCartFeedback } from '../hooks/useCartFeedback';
import { resolveCartStock } from '../lib/cartHelpers';
import { Plus, ShoppingCart, Store, Zap } from 'lucide-react';

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
    has_customization?: boolean;
    venta_web?: boolean;
  };
  onOpenBuilder?: () => void;
  compact?: boolean;
}

export default function AddToCartButton({ producto, onOpenBuilder, compact = false }: AddToCartButtonProps) {
  const { items } = useCart();
  const { addWithFeedback } = useCartFeedback();

  const inCart = items.find(i => i.idproducto === producto.idproducto);
  const quantity = inCart?.cantidad || 0;

  const stockReal = producto.stock_disponible ?? producto.stock;
  const compraWeb = producto.venta_web !== false;
  const idcategoria = producto.categorias?.[0]?.idcategoria ?? null;

  const necesitaBuilder =
    producto.es_pack || producto.has_bundle_options || producto.has_customization;

  const disabled = stockReal <= 0 || !compraWeb;

  const handleAdd = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (disabled) return;
    if (necesitaBuilder && onOpenBuilder) {
      onOpenBuilder();
      return;
    }
    addWithFeedback({
      idproducto: producto.idproducto,
      nombre: producto.nombre,
      precio_venta: producto.precio_venta,
      imagen: producto.imagen_url || null,
      stock: resolveCartStock(stockReal),
      idcategoria,
    });
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => handleAdd(e)}
        disabled={disabled}
        aria-label={
          !compraWeb
            ? 'Solo en local'
            : necesitaBuilder
            ? 'Personalizar pack'
            : 'Agregar al carrito'
        }
        className={`touch-target min-h-[44px] min-w-[44px] rounded-full shadow-md flex items-center justify-center transition-transform active:scale-95 ${
          disabled
            ? 'bg-gray-300 cursor-not-allowed'
            : quantity > 0
            ? 'bg-brand-primary-hover text-white ring-2 ring-white'
            : necesitaBuilder
            ? 'bg-brand-accent text-brand-ink'
            : 'bg-brand-primary text-white hover:bg-brand-primary-hover'
        }`}
      >
        {!compraWeb ? (
          <Store className="h-4 w-4 opacity-70" />
        ) : stockReal <= 0 ? (
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
      onClick={(e) => handleAdd(e)}
      disabled={disabled}
      className={`w-full min-h-[44px] py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium ${
        disabled
          ? 'bg-gray-300 cursor-not-allowed'
          : quantity > 0
          ? 'bg-brand-success hover:bg-brand-success text-white shadow-md shadow-green-500/20'
          : producto.es_pack
          ? 'bg-gradient-to-r from-brand-primary to-brand-success hover:from-brand-primary-hover hover:to-brand-primary text-white shadow-md shadow-brand-primary/20'
          : 'bg-brand-primary hover:bg-brand-primary-hover text-white shadow-md shadow-brand-primary/20'
      }`}
    >
      {!compraWeb ? (
        <Store className="h-4 w-4" />
      ) : stockReal <= 0 ? (
        <ShoppingCart className="h-4 w-4" />
      ) : necesitaBuilder ? (
        <span>⚡</span>
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {!compraWeb
        ? 'Solo en local · Watt 205'
        : stockReal <= 0
        ? 'Sin stock'
        : quantity > 0
        ? `En carrito (${quantity})`
        : necesitaBuilder
        ? '⚡ Personalizar'
        : 'Agregar al carrito'}
    </button>
  );
}
