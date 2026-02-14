import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  idproducto: number;
  nombre: string;
  precio_venta: number;
  cantidad: number;
  imagen?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        const existing = items.find((i) => i.idproducto === product.idproducto);
        if (existing) {
          set({
            items: items.map((i) =>
              i.idproducto === product.idproducto
                ? { ...i, cantidad: i.cantidad + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                idproducto: product.idproducto,
                nombre: product.nombre,
                precio_venta: product.precio_venta,
                cantidad: 1,
                imagen: product.imagen,
              },
            ],
          });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.idproducto !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.idproducto === id ? { ...i, cantidad: quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce((sum, i) => sum + i.precio_venta * i.cantidad, 0),
      getCount: () =>
        get().items.reduce((sum, i) => sum + i.cantidad, 0),
    }),
    { name: 'cart-storage' }
  )
);
