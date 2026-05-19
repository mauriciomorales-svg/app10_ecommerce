'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Categoria {
  idcategoria: number;
  nombre: string;
}

const QUICK = [
  { emoji: '🥤', query: 'bebida' },
  { emoji: '🍿', query: 'snack' },
  { emoji: '🧴', query: 'limpieza' },
  { emoji: '🥛', query: 'leche' },
];

export default function MobileCategoryStrip() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const categoriaActiva = searchParams.get('categoria') || '';

  useEffect(() => {
    fetch('/api/productos/categorias')
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((data) => setCategorias(data.data || data || []))
      .catch(() => setCategorias([]));
  }, []);

  const goCategoria = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('categoria', id);
    else params.delete('categoria');
    router.push(`/?${params.toString()}#catalogo`);
  };

  const goBuscar = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('buscar', q);
    params.delete('categoria');
    router.push(`/?${params.toString()}#catalogo`);
  };

  return (
    <div className="lg:hidden mb-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          type="button"
          onClick={() => goCategoria('')}
          className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border ${
            !categoriaActiva && !searchParams.get('buscar')
              ? 'bg-[#16a34a] text-white border-[#16a34a]'
              : 'bg-white border-gray-200 text-gray-700'
          }`}
        >
          Todos
        </button>
        {QUICK.map((q) => (
          <button
            key={q.query}
            type="button"
            onClick={() => goBuscar(q.query)}
            className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-gray-200"
          >
            {q.emoji} {q.query}
          </button>
        ))}
        {categorias.slice(0, 12).map((cat) => (
          <button
            key={cat.idcategoria}
            type="button"
            onClick={() => goCategoria(String(cat.idcategoria))}
            className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border whitespace-nowrap ${
              categoriaActiva === String(cat.idcategoria)
                ? 'bg-[#16a34a] text-white border-[#16a34a]'
                : 'bg-white border-gray-200 text-gray-700'
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
