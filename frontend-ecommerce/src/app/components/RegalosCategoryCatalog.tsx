'use client';

import { Suspense, useEffect, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import ProductGrid from './ProductGrid';

type Categoria = { idcategoria: number; nombre: string };

export default function RegalosCategoryCatalog() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tienda/experiencias-home')
      .then((r) => r.json())
      .then((d) => {
        const cats: Categoria[] = d.regalos_destacados?.categorias ?? d.regalos?.categorias ?? [];
        setCategorias(cats);
        if (cats[0]) setActiveId(String(cats[0].idcategoria));
      })
      .catch(() => setCategorias([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-7 w-7 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!activeId) {
    return null;
  }

  return (
    <details className="group mt-8 scroll-mt-24 rounded-[1.35rem] border border-rose-100/80 bg-white/60 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 sm:px-5 [&::-webkit-details-marker]:hidden">
        <div>
          <span className="premium-kicker">Opcional</span>
          <h2 className="font-display text-lg font-extrabold text-brand-ink sm:text-xl">
            Más regalos y empaque
          </h2>
          <p className="mt-0.5 text-sm text-brand-muted">
            Empaque suelto y artículos de ocasión — los packs de arriba son la experiencia principal.
          </p>
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-rose-600 transition-transform group-open:rotate-180" />
      </summary>

      <div id="regalos-catalogo-extra" className="border-t border-rose-100/80 px-3 pb-4 pt-3 sm:px-4">
        {categorias.length > 1 && (
          <div className="premium-chip-row mb-4">
            {categorias.map((c) => {
              const active = activeId === String(c.idcategoria);
              return (
                <button
                  key={c.idcategoria}
                  type="button"
                  onClick={() => setActiveId(String(c.idcategoria))}
                  className={`premium-chip ${
                    active
                      ? 'border-rose-600 bg-rose-600 text-white shadow-md'
                      : 'premium-chip-idle hover:border-rose-300 hover:bg-rose-50'
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
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              </div>
            }
          >
            <ProductGrid key={activeId} categoriaOverride={activeId} />
          </Suspense>
        </div>
      </div>
    </details>
  );
}
