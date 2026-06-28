'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toCLP } from '../lib/money';
import { buildCartLineId, cartLineId } from '../lib/cartLineId';

export interface CartItem {
  line_id?: string;
  idproducto: number;
  nombre: string;
  precio_venta: number;
  imagen: string | null;
  cantidad: number;
  stock: number;
  idcategoria?: number | null;
  bundle_configuration?: {
    modifiers?: object[];
    customization?: object;
    suggestions?: { idproducto: number; nombre: string; precio_venta: number; imagen_url?: string }[];
  };
  /** Ítems fijos o elegidos del pack — visible en carrito y checkout */
  pack_includes?: string[];
}

function normalizeItem(raw: CartItem): CartItem {
  const precio = toCLP(raw.precio_venta);
  const stock = typeof raw.stock === 'number' ? raw.stock : Number(raw.stock) || 0;
  const cantidad = typeof raw.cantidad === 'number' ? raw.cantidad : Number(raw.cantidad) || 1;
  const bundle = raw.bundle_configuration;
  let bundle_configuration = bundle;
  if (bundle?.suggestions?.length) {
    bundle_configuration = {
      ...bundle,
      suggestions: bundle.suggestions.map(s => ({
        ...s,
        precio_venta: toCLP(s.precio_venta),
      })),
    };
  }
  const line_id = raw.line_id ?? buildCartLineId(raw.idproducto, bundle_configuration);

  const pack_includes = Array.isArray(raw.pack_includes)
    ? raw.pack_includes.filter((line) => typeof line === 'string' && line.trim() !== '')
    : undefined;

  return {
    ...raw,
    line_id,
    precio_venta: precio,
    stock,
    cantidad: Math.max(1, cantidad),
    bundle_configuration,
    pack_includes: pack_includes?.length ? pack_includes : undefined,
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'cantidad' | 'line_id'> & { line_id?: string }) => void;
  removeFromCart: (lineId: string) => void;
  updateQuantity: (lineId: string, cantidad: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  hydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CartItem[];
        setItems(Array.isArray(parsed) ? parsed.map(normalizeItem) : []);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (product: Omit<CartItem, 'cantidad' | 'line_id'> & { line_id?: string }) => {
    const p = normalizeItem({ ...product, cantidad: 1 });
    const key = cartLineId(p);
    setItems(prev => {
      const existing = prev.find(i => cartLineId(i) === key);
      const next = existing
        ? prev.map(i =>
            cartLineId(i) === key
              ? {
                  ...i,
                  cantidad: Math.min(i.cantidad + 1, product.stock),
                  pack_includes: p.pack_includes?.length ? p.pack_includes : i.pack_includes,
                }
              : i
          )
        : [...prev, p];
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(next));
      }
      return next;
    });
  };

  const removeFromCart = (lineId: string) => {
    setItems(prev => prev.filter(i => cartLineId(i) !== lineId));
  };

  const updateQuantity = (lineId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(lineId);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        cartLineId(i) === lineId ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + toCLP(i.precio_venta) * i.cantidad, 0);
  const count = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      count,
      hydrated: mounted,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
