'use client';

import Link from 'next/link';
import { Flame, Gift, IceCream, Package } from 'lucide-react';

export type ExperienceNavActive = 'helados' | 'regalos' | 'salada' | 'packs' | null;

const ITEMS = [
  { href: '/packs', label: 'Packs', icon: Package, key: 'packs' as const },
  { href: '/helados', label: 'Helados', icon: IceCream, key: 'helados' as const },
  { href: '/regalos', label: 'Regalos', icon: Gift, key: 'regalos' as const },
  { href: '/salada', label: 'Comida', icon: Flame, key: 'salada' as const },
];

export default function ExperienceMobileNav({ active = null }: { active?: ExperienceNavActive }) {
  return (
    <nav aria-label="Experiencias Toppi's" className="experience-mobile-nav lg:hidden">
      <div className="experience-mobile-nav-inner">
        {ITEMS.map(({ href, label, icon: Icon, key }) => {
          const isActive = active === key;
          return (
            <Link
              key={key}
              href={href}
              className={`experience-mobile-nav-link ${
                isActive
                  ? 'border-brand-primary bg-emerald-50 text-brand-primary shadow-sm'
                  : 'border-slate-200/90 bg-white text-brand-ink hover:border-brand-primary/40'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
