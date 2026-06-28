'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Categoria {
  idcategoria: number;
  nombre: string;
}

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
    params.delete('buscar');
    router.push(`/?${params.toString()}#catalogo`);
  };

  const active = 'bg-brand-primary text-white border-brand-primary';
  const idle = 'bg-white border-slate-200 text-brand-ink';

  return (
    <div className="lg:hidden mb-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          type="button"
          onClick={() => goCategoria('')}
          className={`shrink-0 min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-bold border ${
            !categoriaActiva && !searchParams.get('buscar') ? active : idle
          }`}
        >
          Todos
        </button>
        {categorias.slice(0, 14).map((cat) => (
          <button
            key={cat.idcategoria}
            type="button"
            onClick={() => goCategoria(String(cat.idcategoria))}
            className={`shrink-0 min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-semibold border whitespace-nowrap ${
              categoriaActiva === String(cat.idcategoria) ? active : idle
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
