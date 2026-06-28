'use client';

import { MonitorSmartphone, ScanLine, UtensilsCrossed } from 'lucide-react';

export type CatalogRubro = 'comida' | 'retail' | 'mixto';

const TABS: {
  id: CatalogRubro;
  label: string;
  sub: string;
  icon: typeof UtensilsCrossed;
  hash: string;
}[] = [
  { id: 'comida', label: 'Comida', sub: 'Tablet de pedidos', icon: UtensilsCrossed, hash: 'kiosko' },
  { id: 'retail', label: 'Minimarket', sub: 'Barra e inventario', icon: ScanLine, hash: 'retail' },
  { id: 'mixto', label: 'Local mixto', sub: 'Comida + góndola', icon: MonitorSmartphone, hash: 'omnicanal' },
];

export function rubroFromHash(hash: string): CatalogRubro {
  if (hash.includes('retail')) return 'retail';
  if (hash.includes('omnicanal')) return 'mixto';
  return 'comida';
}

export function JhCatalogRubroTabs({
  active,
  onChange,
}: {
  active: CatalogRubro;
  onChange: (rubro: CatalogRubro) => void;
}) {
  const select = (rubro: CatalogRubro, hash: string) => {
    onChange(rubro);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${hash}`);
    }
  };

  return (
    <section className="sticky top-[57px] z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto max-w-4xl">
        <p className="mb-2 text-center text-xs font-bold text-[var(--jh-muted)]">Elige tu rubro — solo ves lo relevante</p>
        <div className="grid grid-cols-3 gap-2">
          {TABS.map(({ id, label, sub, icon: Icon, hash }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => select(id, hash)}
                className={`flex flex-col items-center rounded-xl border-2 px-2 py-3 text-center transition ${
                  isActive
                    ? 'border-[var(--jh-green)] bg-[var(--jh-green-soft)] shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? 'text-[var(--jh-green-dark)]' : 'text-[var(--jh-muted)]'}`}
                  strokeWidth={2}
                />
                <span className="mt-1 text-xs font-extrabold text-[var(--jh-ink)]">{label}</span>
                <span className="mt-0.5 hidden text-[10px] font-medium text-[var(--jh-muted)] sm:block">{sub}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
