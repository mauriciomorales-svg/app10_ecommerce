'use client';

import Link from 'next/link';
import {
  CupSoda,
  Cookie,
  Sparkles,
  Milk,
  ShoppingBasket,
  Tag,
  type LucideIcon,
} from 'lucide-react';

const QUICK: { name: string; href: string; Icon: LucideIcon }[] = [
  { name: 'Bebidas', href: '/?buscar=bebida#catalogo', Icon: CupSoda },
  { name: 'Snacks', href: '/?buscar=snack#catalogo', Icon: Cookie },
  { name: 'Limpieza', href: '/?buscar=limpieza#catalogo', Icon: Sparkles },
  { name: 'Lácteos', href: '/?buscar=leche#catalogo', Icon: Milk },
  { name: 'Abarrotes', href: '/?buscar=arroz#catalogo', Icon: ShoppingBasket },
];

export default function QuickCategoryNav() {
  return (
    <section className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
      <p className="premium-kicker mb-2 px-0.5">Atajos del minimarket</p>
      <div className="premium-scroll-fade flex snap-x gap-2.5 overflow-x-auto pb-1">
        <Link
          href="/?orden=precio_menor#catalogo"
          className="flex h-[78px] w-[78px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border-2 border-brand-accent/40 bg-gradient-to-br from-amber-50 to-brand-accent/15 shadow-md shadow-brand-accent/15 transition-all hover:border-brand-accent hover:shadow-lg"
        >
          <Tag className="h-6 w-6 text-brand-accent" strokeWidth={2.5} />
          <span className="mt-1 text-[10px] font-bold text-brand-ink">Ofertas</span>
        </Link>
        {QUICK.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex h-[78px] w-[78px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white/95 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-premium`}
          >
            <item.Icon className="h-6 w-6 text-brand-primary" strokeWidth={2} />
            <span className="mt-1 px-0.5 text-center text-[10px] font-semibold leading-tight text-brand-ink">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
