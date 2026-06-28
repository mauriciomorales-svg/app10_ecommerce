'use client';

import { Suspense, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ProductGrid from './ProductGrid';

type Categoria = { idcategoria: number; nombre: string };

export default function SaladaCategoryCatalog() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tienda/experiencias-home')
      .then((r) => r.json())
      .then((d) => {
        const cats: Categoria[] = d.salada_destacados?.categorias ?? d.salada?.categorias ?? [];
        setCategorias(cats);
        if (cats[0]) setActiveId(String(cats[0].idcategoria));
      })
      .catch(() => setCategorias([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!activeId) {
    return <p className="py-8 text-center text-sm text-brand-muted">No hay categorías saladas disponibles.</p>;
  }

  return (
    <section id="catalogo-salada" className="scroll-mt-24 pb-4">
      <div className="premium-section-head mb-4">
        <span className="premium-kicker">Menú completo</span>
        <h2 className="premium-heading">Menú Comida Toppi&apos;s</h2>
        <p className="mt-1 text-sm text-brand-muted">Bases, wok, chorrillanas y completos Toppi&apos;s</p>
      </div>

      {categorias.length > 1 && (
        <div className="premium-chip-row">
          {categorias.map((c) => {
            const active = activeId === String(c.idcategoria);
            return (
              <button
                key={c.idcategoria}
                type="button"
                onClick={() => setActiveId(String(c.idcategoria))}
                className={`premium-chip ${
                  active
                    ? 'border-orange-600 bg-orange-600 text-white shadow-md'
                    : 'premium-chip-idle hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                {c.nombre}
              </button>
            );
          })}
        </div>
      )}

      <div className="premium-catalog-shell">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
          }
        >
          <ProductGrid key={activeId} categoriaOverride={activeId} alcanceOverride="salada" />
        </Suspense>
      </div>
    </section>
  );
}
