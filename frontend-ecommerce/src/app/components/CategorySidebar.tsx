'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, ChevronRight } from 'lucide-react';

interface Categoria {
  idcategoria: number;
  nombre: string;
}

export default function CategorySidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const categoriaActiva = searchParams.get('categoria') || '';
  const ordenActivo = searchParams.get('orden') || 'nuevos';

  useEffect(() => {
    fetch('/api/productos/categorias')
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((data) => setCategorias(data.data || data || []))
      .catch(() => setCategorias([]));
  }, []);

  const setCategoria = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set('categoria', id);
    else params.delete('categoria');
    router.push(`/?${params.toString()}#catalogo`);
  };

  const setOrden = (orden: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('orden', orden);
    router.push(`/?${params.toString()}#catalogo`);
  };

  const activeClass =
    'bg-brand-primary text-white shadow-md shadow-brand-primary/20';
  const idleClass = 'text-brand-muted hover:bg-brand-surface hover:text-brand-ink';

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden sticky top-24">
      <div className="bg-brand-primary p-5">
        <h3 className="font-display font-bold text-white flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-brand-accent" />
          Categorías
        </h3>
      </div>

      <div className="p-3 max-h-[60vh] overflow-y-auto">
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={() => setCategoria('')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              !categoriaActiva ? activeClass : idleClass
            }`}
          >
            <span>Todas</span>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.idcategoria}
              type="button"
              onClick={() => setCategoria(cat.idcategoria.toString())}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                categoriaActiva === cat.idcategoria.toString() ? activeClass : idleClass
              }`}
            >
              <span className="truncate pr-2">{cat.nombre}</span>
              <ChevronRight className="h-4 w-4 opacity-50 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 p-4">
        <h4 className="font-semibold text-xs uppercase text-brand-muted tracking-wider mb-3">
          Ordenar por
        </h4>
        <select
          value={ordenActivo}
          onChange={(e) => setOrden(e.target.value)}
          className="w-full px-4 py-2.5 bg-brand-surface border border-slate-200 rounded-xl text-sm text-brand-ink focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
        >
          <option value="nuevos">Más nuevos</option>
          <option value="precio_menor">Precio: menor a mayor</option>
          <option value="precio_mayor">Precio: mayor a menor</option>
          <option value="nombre">Nombre A-Z</option>
        </select>
      </div>
    </div>
  );
}
