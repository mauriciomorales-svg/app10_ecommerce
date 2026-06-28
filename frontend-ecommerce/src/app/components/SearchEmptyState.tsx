'use client';

import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { SEARCH_SCOPE_META, type SearchScope } from '../lib/searchScope';

type Props = {
  query: string;
  scope?: SearchScope;
  onTryTerm?: (term: string) => void;
};

export default function SearchEmptyState({ query, scope = 'home', onTryTerm }: Props) {
  const meta = SEARCH_SCOPE_META[scope];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-10 text-center shadow-sm">
      <SearchX className="mx-auto mb-3 h-12 w-12 text-slate-300" />
      <h3 className="font-display text-lg font-extrabold text-brand-ink">
        Sin resultados para &ldquo;{query}&rdquo;
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-brand-muted">{meta.emptyHint}</p>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-brand-muted">
        Prueba buscar
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {meta.popular.map((term) =>
          onTryTerm ? (
            <button
              key={term}
              type="button"
              onClick={() => onTryTerm(term)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink transition hover:border-brand-primary hover:bg-emerald-50"
            >
              {term}
            </button>
          ) : (
            <Link
              key={term}
              href={`${meta.targetPath}?buscar=${encodeURIComponent(term)}#${meta.hash}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink transition hover:border-brand-primary hover:bg-emerald-50"
            >
              {term}
            </Link>
          ),
        )}
      </div>
      <Link
        href={meta.targetPath}
        className="mt-5 inline-block text-xs font-bold text-brand-primary underline hover:text-brand-primary-hover"
      >
        Ver catálogo completo
      </Link>
    </div>
  );
}
