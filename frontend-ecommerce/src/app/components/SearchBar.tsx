'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  variant?: 'default' | 'compact';
}

export default function SearchBar({ variant = 'default' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialValue = searchParams.get('buscar') || '';
  const [query, setQuery] = useState(initialValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('buscar', query.trim());
      } else {
        params.delete('buscar');
      }
      const qs = params.toString();
      router.push(qs ? `/?${qs}#catalogo` : '/#catalogo');
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('buscar');
    router.push('/#catalogo');
  };

  const isCompact = variant === 'compact';

  return (
    <div className={isCompact ? 'relative w-full' : 'relative max-w-2xl mx-auto'}>
      <Search
        className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${
          isCompact ? 'left-3 h-4 w-4' : 'left-5 h-5 w-5'
        }`}
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar producto o marca..."
        className={
          isCompact
            ? 'w-full pl-9 pr-9 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#16a34a]/30 focus:border-[#16a34a]'
            : 'input-search pl-14 pr-14'
        }
        autoComplete="off"
      />
      {query && (
        <button
          onClick={clearSearch}
          className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors ${
            isCompact ? 'right-2 w-6 h-6' : 'right-5 w-8 h-8'
          }`}
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}
