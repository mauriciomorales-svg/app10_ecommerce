'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Gift, Loader2, Sparkles } from 'lucide-react';
import ProductBuilderModal from './ProductBuilderModal';
import type { PackComponentePreview } from './PackComponentesPreview';
import PackShareActions from './PackShareActions';
import RegalosFavoritosPanel from './RegalosFavoritosPanel';
import { usePackFavoritos } from '../hooks/usePackFavoritos';
import { useCartFeedback } from '../hooks/useCartFeedback';
import { useQuickAddCombo } from '../hooks/useQuickAddCombo';
import { matchesOcasion } from './RegalosOcasionLanding';
import ExperienceSectionFallback from './ExperienceSectionFallback';
import { useRegalosExperienciaOptional } from '../context/RegalosExperienciaContext';
import { resolveCartStock } from '../lib/cartHelpers';
import { toCLP } from '../lib/money';

type DestacadoItem = {
  nombre: string;
  badge?: string;
  concepto?: string;
  descripcion_corta?: string;
  modalidad_label?: string;
  gradient?: string;
  imagen_url?: string | null;
  idproducto?: number | null;
  precio_desde?: number | null;
  siempre_incluye?: string[];
  tu_eliges?: { grupo: string; tipo: string; opciones: string[] }[];
  has_bundle_options?: boolean;
  quick_add?: boolean;
  ocasion?: string;
  componentes_preview?: PackComponentePreview[];
  mas_pedido?: boolean;
};

type FlujoPaso = { paso: number; titulo: string; texto: string };

type RegalosDestacadosData = {
  title: string;
  tagline: string;
  subtitle: string;
  mensaje_personalizable?: string;
  flujo?: FlujoPaso[];
  destacados: DestacadoItem[];
};

function RegaloCard({
  item,
  onOpenBuilder,
  loadingId,
  isFavorite,
  onToggleFavorite,
  wide,
}: {
  item: DestacadoItem;
  onOpenBuilder: (id: number) => void;
  loadingId?: number | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  wide?: boolean;
}) {
  const canOrder = Boolean(item.idproducto);
  const fijos = item.siempre_incluye ?? [];
  const needsBuilder = Boolean(item.has_bundle_options);
  const quickAdd = Boolean(item.quick_add);
  const isLoading = loadingId === item.idproducto;
  const productHref = item.idproducto ? `/producto/${item.idproducto}` : '#';

  return (
    <article className={`group relative flex shrink-0 snap-start flex-col overflow-hidden rounded-[1.25rem] border border-rose-200/60 bg-gradient-to-br shadow-premium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg ${wide ? 'w-[min(88vw,300px)] sm:w-[280px]' : 'w-[200px] sm:w-[240px]'}`}>
      {item.imagen_url ? (
        <div className="relative h-36 w-full shrink-0">
          <Image
            src={item.imagen_url}
            alt={item.nombre}
            fill
            className="object-cover"
            sizes="240px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className={`h-28 bg-gradient-to-br ${item.gradient ?? 'from-rose-800 to-violet-950'}`} />
      )}
      <div className={`relative z-10 flex flex-1 flex-col p-4 text-white ${item.imagen_url ? '-mt-12' : '-mt-10'}`}>
        {item.badge && (
          <span className="mb-2 inline-flex w-fit rounded-full bg-rose-400/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-rose-100">
            {item.badge}
          </span>
        )}
        {item.mas_pedido && (
          <span className="mb-2 ml-1 inline-flex w-fit rounded-full bg-amber-400/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950">
            Recomendado
          </span>
        )}
        <h3 className="font-display text-base font-extrabold leading-tight">{item.nombre}</h3>
        {item.concepto && (
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/60">
            {item.concepto}
          </p>
        )}
        {item.modalidad_label && (
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-white/55">
            {item.modalidad_label}
          </p>
        )}
        <p className="mt-2 flex-1 text-xs leading-relaxed text-white/80">{item.descripcion_corta}</p>
        {fijos.length > 0 && (
          <div className="mt-2 rounded-lg bg-white/10 px-2 py-1.5 text-[10px] leading-relaxed text-white/90 ring-1 ring-white/15">
            <p className="font-bold uppercase tracking-wide text-emerald-200">Incluye</p>
            <ul className="mt-0.5 max-h-40 list-inside list-disc space-y-0.5 overflow-y-auto">
              {fijos.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}
        {item.precio_desde != null && (
          <p className="mt-3 font-display text-lg font-extrabold text-rose-200">
            {needsBuilder ? 'desde ' : ''}
            {toCLP(item.precio_desde)}
          </p>
        )}
        {canOrder && item.idproducto && (
          <PackShareActions
            pack={{
              nombre: item.nombre,
              precio: item.precio_desde,
              siempre_incluye: fijos,
              idproducto: item.idproducto,
              ocasion: item.ocasion,
            }}
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
            variant="dark"
            compact
          />
        )}
        {canOrder && quickAdd ? (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => item.idproducto && onOpenBuilder(item.idproducto)}
            className="mt-3 w-full rounded-xl bg-white py-2.5 text-xs font-bold text-rose-950 transition hover:bg-rose-50 disabled:opacity-50"
          >
            {isLoading ? 'Agregando…' : 'Agregar al carrito'}
          </button>
        ) : canOrder && !needsBuilder ? (
          <Link
            href={productHref}
            className="mt-3 block w-full rounded-xl bg-white py-2.5 text-center text-xs font-bold text-rose-950 transition hover:bg-rose-50"
          >
            Ver qué incluye y reservar
          </Link>
        ) : (
          <button
            type="button"
            disabled={!canOrder}
            onClick={() => item.idproducto && onOpenBuilder(item.idproducto)}
            className="mt-3 w-full rounded-xl bg-white py-2.5 text-xs font-bold text-rose-950 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {canOrder ? 'Diseñar regalo' : 'Próximamente'}
          </button>
        )}
      </div>
    </article>
  );
}

function RegalosFlujoStrip({ pasos }: { pasos: FlujoPaso[] }) {
  if (pasos.length === 0) return null;

  return (
    <div className="mb-4 grid gap-2 sm:grid-cols-3">
      {pasos.map((p) => (
        <div
          key={p.paso}
          className="glass-panel rounded-[1.15rem] px-3 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
            Paso {p.paso}
          </p>
          <p className="text-sm font-bold text-brand-ink">{p.titulo}</p>
          <p className="text-xs text-brand-muted">{p.texto}</p>
        </div>
      ))}
    </div>
  );
}

type Props = {
  variant?: 'home' | 'page';
  ocasionFilter?: string;
};

export default function RegalosDestacadosSection({ variant = 'home', ocasionFilter = 'todos' }: Props) {
  const ctx = useRegalosExperienciaOptional();
  const [localData, setLocalData] = useState<RegalosDestacadosData | null>(null);
  const [localLoading, setLocalLoading] = useState(!ctx);
  const [fetchError, setFetchError] = useState(false);
  const [builderProductId, setBuilderProductId] = useState<number | null>(null);
  const { addWithFeedback } = useCartFeedback();
  const { quickAddOrOpen, loadingId } = useQuickAddCombo(setBuilderProductId);
  const { favoritos, isFavorite, toggleFavorite, removeFavorite } = usePackFavoritos();
  const isHome = variant === 'home';
  const useShared = Boolean(ctx);

  const loadData = () => {
    if (useShared) {
      ctx!.reload();
      return;
    }
    setLocalLoading(true);
    setFetchError(false);
    fetch('/api/tienda/experiencias-home')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((json) => setLocalData(json.regalos_destacados ?? null))
      .catch(() => {
        setLocalData(null);
        setFetchError(true);
      })
      .finally(() => setLocalLoading(false));
  };

  useEffect(() => {
    if (!useShared) {
      loadData();
    }
  }, [useShared]);

  const loading = useShared ? ctx!.loading : localLoading;
  const rawData = useShared
    ? (ctx!.data?.regalos_destacados as RegalosDestacadosData | undefined) ?? null
    : localData;
  const error = useShared ? ctx!.error : fetchError;
  const premiumNombres = ctx?.premiumNombres ?? new Set<string>();

  const data = useMemo(() => {
    if (!rawData) return null;
    if (isHome) return rawData;
    return {
      ...rawData,
      destacados: rawData.destacados.filter((item) => !premiumNombres.has(item.nombre)),
    };
  }, [rawData, isHome, premiumNombres]);

  if (loading || error || !data || data.destacados.length === 0) {
    return (
      <ExperienceSectionFallback
        loading={loading}
        error={error}
        empty={!loading && !error && (!data || data.destacados.length === 0)}
        emptyMessage={isHome ? 'Los packs personalizables se publicarán pronto.' : undefined}
        onRetry={loadData}
      />
    );
  }

  const filteredDestacados = data.destacados.filter((item) =>
    matchesOcasion(item.ocasion, ocasionFilter)
  );

  if (!isHome && filteredDestacados.length === 0) {
    if (ocasionFilter !== 'todos') {
      return null;
    }
    return (
      <section className="premium-experience-section premium-experience-section--regalos mb-6">
        <p className="rounded-xl border border-rose-100 bg-white/80 px-4 py-8 text-center text-sm text-brand-muted">
          No hay packs en esta ocasión.{' '}
          <Link href="/regalos" className="font-semibold text-rose-700 underline">
            Ver todos
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section
      id={isHome ? 'regalos-destacados-home' : 'regalos-destacados'}
      className={`relative scroll-mt-24 overflow-hidden ${
        isHome
          ? 'mx-auto mb-4 max-w-7xl rounded-[1.65rem] border border-rose-200/50 bg-gradient-to-br from-white via-rose-50/40 to-violet-50/30 px-3 py-5 shadow-premium sm:px-5 sm:py-6'
          : 'premium-experience-section premium-experience-section--regalos mb-6'
      }`}
    >
      {isHome ? (
        <div className="relative mb-4">
          <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
            <Gift className="h-3.5 w-3.5" />
            Regalo Toppi&apos;s
          </span>
          <h2 className="font-display text-2xl font-extrabold text-brand-ink sm:text-3xl">{data.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-brand-muted">{data.tagline}</p>
          {data.subtitle && (
            <p className="mt-1 text-xs font-semibold text-rose-800/70">{data.subtitle}</p>
          )}
          {data.mensaje_personalizable && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-900">
              <Sparkles className="h-3.5 w-3.5 text-rose-500" />
              {data.mensaje_personalizable}
            </p>
          )}
          <Link
            href="/regalos"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline"
          >
            Ver regalo Toppi&apos;s
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="premium-section-head mb-4">
          <span className="premium-kicker">Regalo Toppi&apos;s</span>
          <h2 className="premium-heading">Arma tu regalo</h2>
        </div>
      )}

      {!isHome && data.flujo && <RegalosFlujoStrip pasos={data.flujo} />}

      {!isHome && favoritos.length > 0 && (
        <RegalosFavoritosPanel favoritos={favoritos} onRemove={removeFavorite} />
      )}

      <div className="premium-scroll-fade -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 snap-x">
        {filteredDestacados.map((item) => (
          <RegaloCard
            key={item.nombre}
            item={item}
            onOpenBuilder={quickAddOrOpen}
            loadingId={loadingId}
            wide={!isHome}
            isFavorite={isFavorite(item.idproducto)}
            onToggleFavorite={
              item.idproducto
                ? () =>
                    toggleFavorite({
                      idproducto: item.idproducto!,
                      nombre: item.nombre,
                      precio: item.precio_desde,
                      imagen_url: item.imagen_url,
                      ocasion: item.ocasion,
                    })
                : undefined
            }
          />
        ))}
      </div>

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
