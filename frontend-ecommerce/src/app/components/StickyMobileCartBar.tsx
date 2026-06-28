'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function StickyMobileCartBar() {
  const { count, total, hydrated } = useCart();
  const pathname = usePathname();

  if (!hydrated || count <= 0) return null;
  if (pathname?.startsWith('/producto/')) return null;

  return (
    <div className="sticky-mobile-cart-bar fixed bottom-0 left-0 right-0 z-40 md:hidden p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-brand-surface via-brand-surface to-transparent pointer-events-none">
      <Link
        href="/cart"
        className="pointer-events-auto flex items-center justify-between w-full max-w-lg mx-auto bg-brand-primary text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-brand-primary/30 font-display font-bold"
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
