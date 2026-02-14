'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  idproducto: number;
  nombre: string;
  precio_venta: number;
  imagen: string | null;
  cantidad: number;
  stock: number;
  bundle_configuration?: {
    modifiers?: object[];
    customization?: object;
    suggestions?: { idproducto: number; nombre: string; precio_venta: number; imagen_url?: string }[];
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
        setItems(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (product: Omit<CartItem, 'cantidad'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.idproducto === product.idproducto);
      if (existing) {
        const newCantidad = Math.min(existing.cantidad + 1, product.stock);
        return prev.map(i =>
          i.idproducto === product.idproducto
            ? { ...i, cantidad: newCantidad }
            : i
        );
      }
      return [...prev, { ...product, cantidad: 1 }];
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

  const total = items.reduce((sum, i) => sum + i.precio_venta * i.cantidad, 0);
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
