'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar() {
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
      router.push(`/?${params.toString()}`);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('buscar');
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Busca el regalo perfecto..."
        className="input-search pl-14 pr-14"
        autoComplete="off"
      />
      {query && (
        <button
          onClick={clearSearch}
          className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}
