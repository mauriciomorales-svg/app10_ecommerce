'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, ChevronRight } from 'lucide-react';

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
      .then(res => res.ok ? res.json() : { data: [] })
      .then(data => setCategorias(data.data || data || []))
      .catch(() => setCategorias([]));
  }, []);

  const setCategoria = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set('categoria', id);
    } else {
      params.delete('categoria');
    }
    router.push(`/?${params.toString()}`);
  };

  const setOrden = (orden: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('orden', orden);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-20">
      <div className="bg-gradient-to-r from-[#880e4f] to-[#d81b60] p-5">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-pink-200" />
          Categorías
        </h3>
      </div>

      <div className="p-4 max-h-[60vh] overflow-y-auto">
        <div className="space-y-1">
          <button
            onClick={() => setCategoria('')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!categoriaActiva ? 'bg-[#d81b60] text-white shadow-md shadow-pink-500/20' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <span>Todas</span>
            <ChevronRight className="h-4 w-4 opacity-50" />
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.idcategoria}
              onClick={() => setCategoria(cat.idcategoria.toString())}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${categoriaActiva === cat.idcategoria.toString() ? 'bg-[#d81b60] text-white shadow-md shadow-pink-500/20' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span>{cat.nombre}</span>
              <ChevronRight className="h-4 w-4 opacity-50" />
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 p-4">
        <h4 className="font-semibold text-xs uppercase text-gray-400 tracking-wider mb-3">Ordenar por</h4>
        <select
          value={ordenActivo}
          onChange={(e) => setOrden(e.target.value)}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] outline-none transition-all"
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
