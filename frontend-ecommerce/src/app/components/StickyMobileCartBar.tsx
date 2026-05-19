'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function StickyMobileCartBar() {
  const { count, total } = useCart();

  if (count <= 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-[#f0fdf4] via-[#f0fdf4] to-transparent pointer-events-none">
      <Link
        href="/cart"
        className="pointer-events-auto flex items-center justify-between w-full max-w-lg mx-auto bg-[#16a34a] text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-900/25 font-bold"
      >
        <span className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Ver carrito ({count})
        </span>
        <span className="tabular-nums">${total.toLocaleString('es-CL')}</span>
      </Link>
    </div>
  );
}
