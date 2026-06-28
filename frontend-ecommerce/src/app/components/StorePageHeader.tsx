import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from './Logo';
import CartButton from './CartButton';
import { Suspense } from 'react';

interface StorePageHeaderProps {
  backHref?: string;
  backLabel?: string;
  title?: string;
}

export default function StorePageHeader({
  backHref = '/',
  backLabel = 'Volver',
  title,
}: StorePageHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="shrink-0 flex items-center gap-1 text-brand-primary hover:text-brand-primary-hover text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{backLabel}</span>
          </Link>
          <div className="flex-1 min-w-0 flex items-center justify-center sm:justify-start">
            {title ? (
              <h1 className="font-display font-bold text-brand-ink text-sm sm:text-base truncate">
                {title}
              </h1>
            ) : (
              <Logo compact className="sm:hidden" />
            )}
          </div>
          <div className="hidden sm:block">
            <Logo compact />
          </div>
          <Suspense>
            <CartButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
