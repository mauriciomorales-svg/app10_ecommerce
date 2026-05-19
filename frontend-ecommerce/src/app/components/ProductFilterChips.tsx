'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const FILTERS = [
  { id: 'nuevos', label: 'Nuevos' },
  { id: 'precio_menor', label: 'Más baratos' },
  { id: 'precio_mayor', label: 'Mayor precio' },
  { id: 'nombre', label: 'A-Z' },
];

export default function ProductFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ordenActivo = searchParams.get('orden') || 'nuevos';

  const setOrden = (orden: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (orden === 'nuevos') {
      params.delete('orden');
    } else {
      params.set('orden', orden);
    }
    router.push(`/?${params.toString()}#catalogo`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
      {FILTERS.map((f) => {
        const active = ordenActivo === f.id || (f.id === 'nuevos' && !searchParams.get('orden'));
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => setOrden(f.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              active
                ? 'bg-[#16a34a] text-white border-[#16a34a]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
