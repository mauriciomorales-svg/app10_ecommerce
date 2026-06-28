'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Loader2, UtensilsCrossed } from 'lucide-react';
import ProductBuilderModal from './ProductBuilderModal';
import { useCartFeedback } from '../hooks/useCartFeedback';
import ExperienceSectionFallback from './ExperienceSectionFallback';
import { resolveCartStock } from '../lib/cartHelpers';
import { toCLP } from '../lib/money';

type DestacadoItem = {
  nombre: string;
  badge?: string;
  concepto?: string;
  descripcion_corta?: string;
  gradient?: string;
  imagen_url?: string | null;
  idproducto?: number | null;
  precio_desde?: number | null;
};

type SaladaDestacadosData = {
  title: string;
  tagline: string;
  subtitle: string;
  destacados: DestacadoItem[];
  arma_tu_base: {
    nombre?: string;
    label?: string;
    idproducto?: number | null;
    precio_desde?: number | null;
  };
};

function DestacadoCard({
  item,
  featured,
  onOrder,
}: {
  item: DestacadoItem;
  featured?: boolean;
  onOrder: (id: number) => void;
}) {
  const canOrder = Boolean(item.idproducto);

  return (
    <article
      className={`group relative flex w-[min(82vw,260px)] shrink-0 snap-start flex-col overflow-hidden rounded-[1.25rem] border bg-gradient-to-br transition-all duration-300 hover:-translate-y-0.5 sm:w-[240px] md:w-full md:max-w-none ${
        featured
          ? 'border-amber-500/50 shadow-premium-lg shadow-amber-600/15 ring-2 ring-amber-400/30'
          : 'border-slate-200/80 shadow-premium hover:shadow-premium-lg'
      }`}
    >
      {item.imagen_url ? (
        <div className="relative h-36 w-full shrink-0">
          <Image
            src={item.imagen_url}
            alt={item.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 260px, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        </div>
      ) : (
        <div className={`h-28 bg-gradient-to-br ${item.gradient ?? 'from-orange-800 to-red-950'}`} />
      )}
      <div className={`relative z-10 flex flex-1 flex-col p-4 text-white ${item.imagen_url ? '-mt-10 rounded-b-[1.15rem] bg-gradient-to-t from-black/90 via-black/75 to-black/40 pt-14 sm:-mt-12 sm:pt-16' : '-mt-10'}`}>
        {item.badge && (
          <span className="mb-2 inline-flex w-fit rounded-full bg-amber-400/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-200">
            {item.badge}
          </span>
        )}
        <h3 className="font-display text-base font-extrabold leading-tight">{item.nombre}</h3>
        {item.concepto && (
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
            {item.concepto}
          </p>
        )}
        <p className="mt-2 flex-1 text-xs leading-relaxed text-white/80">{item.descripcion_corta}</p>
        {item.precio_desde != null && (
          <p className="mt-3 font-display text-lg font-extrabold text-amber-300">
            desde {toCLP(item.precio_desde)}
          </p>
        )}
        <button
          type="button"
          disabled={!canOrder}
          onClick={() => item.idproducto && onOrder(item.idproducto)}
          className="mt-3 w-full min-h-[44px] rounded-xl bg-white py-3 text-sm font-bold text-orange-950 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canOrder ? 'Personalizar' : 'Próximamente'}
        </button>
      </div>
    </article>
  );
}

type Props = {
  /** En home: más compacto y con link a /salada */
  variant?: 'home' | 'page';
};

export default function SaladaDestacadosSection({ variant = 'page' }: Props) {
  const [data, setData] = useState<SaladaDestacadosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [builderProductId, setBuilderProductId] = useState<number | null>(null);
  const { addWithFeedback } = useCartFeedback();
  const isHome = variant === 'home';

  const loadData = () => {
    setLoading(true);
    setFetchError(false);
    fetch('/api/tienda/experiencias-home')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((json) => setData(json.salada_destacados ?? null))
      .catch(() => {
        setData(null);
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || fetchError || !data || data.destacados.length === 0) {
    return (
      <ExperienceSectionFallback
        loading={loading}
        error={fetchError}
        empty={!loading && !fetchError && (!data || data.destacados.length === 0)}
        onRetry={loadData}
      />
    );
  }

  const arma = data.arma_tu_base;

  return (
    <section
      id={isHome ? 'salada-destacados-home' : 'salada-destacados'}
      className={`relative scroll-mt-24 overflow-hidden ${
        isHome
          ? 'mx-auto mb-4 max-w-7xl rounded-[1.65rem] border border-amber-300/40 bg-gradient-to-br from-orange-50/90 via-white to-amber-50/50 px-3 py-5 shadow-premium sm:px-5'
          : 'premium-experience-section premium-experience-section--salada mb-6'
      }`}
    >
      {isHome ? (
        <div className="relative mb-4">
          <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-orange-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-200">
            <UtensilsCrossed className="h-3.5 w-3.5" />
            Comida Toppi&apos;s
          </span>
          <h2 className="font-display text-2xl font-extrabold text-brand-ink sm:text-3xl">{data.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-brand-muted sm:text-base">{data.tagline}</p>
          {data.subtitle && (
            <p className="mt-1 text-xs font-semibold text-amber-900/70">{data.subtitle}</p>
          )}
          <Link
            href="/salada"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-orange-700 hover:underline"
          >
            Ver comida Toppi&apos;s
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="premium-section-head mb-4">
          <span className="premium-kicker">Comida Toppi&apos;s</span>
          <h2 className="premium-heading">Platos estrella</h2>
        </div>
      )}

      <p className="scroll-hint-mobile mb-2 text-amber-900/60 md:hidden">Desliza para ver combos →</p>
      <div className="salada-cards-row premium-scroll-fade">
        {data.destacados.map((item, i) => (
          <DestacadoCard
            key={item.nombre}
            item={item}
            featured={i === 0}
            onOrder={setBuilderProductId}
          />
        ))}
      </div>

      {arma?.idproducto && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-dashed border-amber-300/60 bg-white/85 px-4 py-3.5 shadow-inner-soft backdrop-blur-sm">
          <div>
            <p className="text-xs font-bold text-brand-muted">{arma.label ?? 'Arma tu base'}</p>
            <p className="text-sm font-semibold text-brand-ink">
              Papas, tortilla, tallarines o arroz — desde{' '}
              {arma.precio_desde != null ? toCLP(arma.precio_desde) : 'tu elección'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setBuilderProductId(arma.idproducto!)}
            className="rounded-xl border border-amber-400/50 bg-amber-50 px-4 py-2 text-xs font-bold text-orange-950 hover:bg-amber-100"
          >
            Armar base Comida Toppi&apos;s
          </button>
        </div>
      )}

      {builderProductId && (
        <ProductBuilderModal
          productId={builderProductId}
          onClose={() => setBuilderProductId(null)}
          onAddToCart={(item) => {
            addWithFeedback({
              idproducto: item.idproducto,
              nombre: item.nombre,
              precio_venta: item.precio_venta,
              imagen: item.imagen || null,
              stock: resolveCartStock(1, item.bundle_configuration),
              pack_includes: item.pack_includes,
              bundle_configuration: item.bundle_configuration,
              idcategoria: item.idcategoria ?? null,
            });
            setBuilderProductId(null);
          }}
        />
      )}
    </section>
  );
}
