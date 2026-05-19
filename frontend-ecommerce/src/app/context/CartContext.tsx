'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toCLP } from '../lib/money';

export interface CartItem {
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
  return {
    ...raw,
    precio_venta: precio,
    stock,
    cantidad: Math.max(1, cantidad),
    bundle_configuration,
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'cantidad'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, cantidad: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
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

  const addToCart = (product: Omit<CartItem, 'cantidad'>) => {
    const p = normalizeItem({ ...product, cantidad: 1 });
    setItems(prev => {
      const existing = prev.find(i => i.idproducto === p.idproducto);
      if (existing) {
        const newCantidad = Math.min(existing.cantidad + 1, product.stock);
        return prev.map(i =>
          i.idproducto === product.idproducto
            ? { ...i, cantidad: newCantidad }
            : i
        );
      }
      return [...prev, p];
    });
  };

  const removeFromCart = (id: number) => {
    setItems(prev => prev.filter(i => i.idproducto !== id));
  };

  const updateQuantity = (id: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.idproducto === id ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i
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
      count
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
