'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Clock, Loader2, Package, Search, Sparkles, X } from 'lucide-react';
import { SEARCH_SCOPE_META, type SearchScope } from '../lib/searchScope';
import { formatCLP } from '../lib/money';
import { trackCommerceEvent } from '../lib/commerceEvents';
import { pushRecentSearch, readRecentSearches } from '../lib/searchRecent';

type Suggestion = {
  idproducto: number;
  nombre: string;
  precio?: number | null;
  imagen_url?: string | null;
  categoria?: string | null;
  es_pack?: boolean;
};

interface SearchBarProps {
  variant?: 'default' | 'compact';
  scope?: SearchScope;
  /** Sobre hero oscuro en páginas experiencia */
  tone?: 'default' | 'hero';
}

function buildSearchUrl(scope: SearchScope, query: string): string {
  const meta = SEARCH_SCOPE_META[scope];
  const q = query.trim();
  if (!q) return `${meta.targetPath}#${meta.hash}`;
  return `${meta.targetPath}?buscar=${encodeURIComponent(q)}#${meta.hash}`;
}

function SearchBarInner({ variant = 'default', scope = 'home', tone = 'default' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meta = SEARCH_SCOPE_META[scope];
  const initialValue = searchParams.get('buscar') || searchParams.get('q') || '';
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (open) setRecent(readRecentSearches(scope));
  }, [open, scope]);

  const submitSearch = useCallback(
    (raw?: string) => {
      const q = (raw ?? query).trim();
      if (q.length < 2) return;
      pushRecentSearch(scope, q);
      trackCommerceEvent('search_submit', { query: q, scope });
      setOpen(false);
      router.push(buildSearchUrl(scope, q));
    },
    [query, router, scope],
  );

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoadingSuggest(false);
      return;
    }

    setLoadingSuggest(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ q });
      if (meta.alcance) params.set('alcance', meta.alcance);
      if (scope === 'helados') params.set('experiencia', '1');

      fetch(`/api/productos/suggest?${params}`)
        .then((r) => (r.ok ? r.json() : { suggestions: [] }))
        .then((data) => setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []))
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggest(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query, meta.alcance, scope]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setOpen(false);
    setActiveIdx(-1);
    router.push(`${meta.targetPath}#${meta.hash}`);
    inputRef.current?.focus();
  };

  const isCompact = variant === 'compact';
  const isHero = tone === 'hero';
  const trimmed = query.trim();
  const showDropdown = open && (trimmed.length >= 2 || recent.length > 0 || meta.popular.length > 0);

  const flatItems: { type: 'suggest'; data: Suggestion }[] = suggestions.map((s) => ({
    type: 'suggest' as const,
    data: s,
  }));

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && flatItems[activeIdx]) {
        const s = flatItems[activeIdx].data;
        trackCommerceEvent('search_suggest_click', {
          idproducto: s.idproducto,
          nombre: s.nombre,
          scope,
        });
        setOpen(false);
        router.push(`/producto/${s.idproducto}`);
        return;
      }
      submitSearch();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    }
  };

  const inputClass = isHero
    ? 'w-full rounded-2xl border border-white/25 bg-white/95 py-3 pl-10 pr-10 text-sm font-medium text-brand-ink shadow-lg shadow-black/10 outline-none backdrop-blur-sm placeholder:text-slate-400 focus:border-white focus:ring-2 focus:ring-white/40'
    : isCompact
      ? 'w-full rounded-xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-brand-ink shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
      : 'input-search pl-14 pr-14';

  return (
    <div ref={wrapRef} className={`relative ${isCompact || isHero ? 'w-full' : 'mx-auto max-w-2xl'}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
      >
        <Search
          className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 ${
            isHero ? 'left-3.5 h-4 w-4 text-slate-500' : isCompact ? 'left-3 h-4 w-4 text-slate-400' : 'left-5 h-5 w-5 text-gray-400'
          }`}
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIdx(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={meta.placeholder}
          className={inputClass}
          autoComplete="off"
          aria-label="Buscar productos"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions-panel"
          aria-autocomplete="list"
        />
        {(trimmed || loadingSuggest) && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Limpiar búsqueda"
            className={`absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full transition-colors ${
              isHero
                ? 'right-2 h-7 w-7 bg-slate-100 hover:bg-slate-200'
                : 'right-2 h-7 w-7 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {loadingSuggest ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
            ) : (
              <X className="h-4 w-4 text-slate-500" />
            )}
          </button>
        )}
      </form>

      {showDropdown && (
        <div
          id="search-suggestions-panel"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_16px_40px_-12px_rgba(15,23,42,0.18)]"
        >
          {trimmed.length < 2 && (
            <div className="border-b border-slate-100 px-3 py-2.5">
              {recent.length > 0 && (
                <>
                  <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Clock className="h-3 w-3" />
                    Recientes
                  </p>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {recent.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setQuery(term);
                          submitSearch(term);
                        }}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <Sparkles className="h-3 w-3" />
                Populares
              </p>
              <div className="flex flex-wrap gap-1.5">
                {meta.popular.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      submitSearch(term);
                    }}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-brand-ink hover:border-brand-primary hover:bg-emerald-50"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {trimmed.length >= 2 && (
            <>
              {loadingSuggest && suggestions.length === 0 && (
                <p className="px-4 py-3 text-sm text-brand-muted">Buscando en catálogo…</p>
              )}
              <ul className="max-h-64 overflow-y-auto py-1">
                {suggestions.map((s, idx) => (
                  <li key={s.idproducto} role="option" aria-selected={activeIdx === idx}>
                    <Link
                      href={`/producto/${s.idproducto}`}
                      onClick={() => {
                        pushRecentSearch(scope, trimmed);
                        setOpen(false);
                        trackCommerceEvent('search_suggest_click', {
                          idproducto: s.idproducto,
                          nombre: s.nombre,
                          scope,
                        });
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 transition ${
                        activeIdx === idx ? 'bg-emerald-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80">
                        {s.imagen_url ? (
                          <Image src={s.imagen_url} alt="" fill className="object-cover" sizes="44px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="block truncate text-sm font-semibold text-brand-ink">{s.nombre}</span>
                          {s.es_pack && (
                            <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-900">
                              Pack
                            </span>
                          )}
                        </span>
                        {s.categoria && (
                          <span className="block truncate text-[11px] text-brand-muted">{s.categoria}</span>
                        )}
                      </span>
                      {s.precio != null && s.precio > 0 && (
                        <span className="shrink-0 text-sm font-bold tabular-nums text-brand-primary">
                          ${formatCLP(s.precio)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              {!loadingSuggest && suggestions.length === 0 && (
                <p className="px-4 py-3 text-sm text-brand-muted">
                  Sin coincidencias rápidas — pulsa Enter para búsqueda completa
                </p>
              )}
              {trimmed.length >= 2 && (
                <button
                  type="button"
                  onClick={() => submitSearch()}
                  className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50/80 px-4 py-2.5 text-xs font-bold text-brand-primary hover:bg-emerald-50"
                >
                  Ver todos los resultados
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchBar(props: SearchBarProps) {
  return (
    <Suspense fallback={<div className="h-11 animate-pulse rounded-2xl bg-slate-100/80" />}>
      <SearchBarInner {...props} />
    </Suspense>
  );
}
