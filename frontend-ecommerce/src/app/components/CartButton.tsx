'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default function CartButton() {
  const { count, total, hydrated } = useCart();
  const displayCount = hydrated ? count : 0;

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition-all shadow-md shadow-brand-primary/20"
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="font-semibold text-sm tabular-nums hidden sm:inline">
        ${total.toLocaleString('es-CL')}
      </span>
      {displayCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-brand-accent text-brand-ink text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center font-bold">
          {displayCount}
        </span>
      )}
    </Link>
  );
}
