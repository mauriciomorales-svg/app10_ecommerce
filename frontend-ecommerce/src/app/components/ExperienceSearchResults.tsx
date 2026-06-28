'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import ProductGrid from './ProductGrid';
import { SEARCH_SCOPE_META, type SearchScope } from '../lib/searchScope';

type Props = {
  scope: SearchScope;
  title?: string;
};

function ExperienceSearchResultsInner({ scope, title }: Props) {
  const searchParams = useSearchParams();
  const buscar = searchParams.get('buscar') || searchParams.get('q') || '';
  const meta = SEARCH_SCOPE_META[scope];

  if (!buscar.trim()) return null;

  return (
    <section id={meta.hash} className="mb-8 scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 shadow-sm">
        <p className="flex items-center gap-1.5 text-sm text-brand-ink">
          <Search className="h-4 w-4 text-brand-primary" />
          {title ?? 'Resultados'}: <strong>&ldquo;{buscar}&rdquo;</strong>
        </p>
        <Link
          href={meta.targetPath}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-brand-muted hover:bg-slate-50"
        >
          <X className="h-3.5 w-3.5" />
          Limpiar búsqueda
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        }
      >
        <ProductGrid
          key={`${scope}-${buscar}`}
          buscarOverride={buscar}
          alcanceOverride={meta.alcance}
          soloExperiencia={scope === 'helados'}
          searchScope={scope}
        />
      </Suspense>
    </section>
  );
}

export default function ExperienceSearchResults(props: Props) {
  return (
    <Suspense fallback={null}>
      <ExperienceSearchResultsInner {...props} />
    </Suspense>
  );
}
