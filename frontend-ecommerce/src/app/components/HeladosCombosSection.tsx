'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ChevronRight,
  IceCream,
  Loader2,
  Sparkles,
  Star,
  Zap,
  Crown,
  ArrowRight,
  Users,
  Clock,
} from 'lucide-react';
import HeladosSemanaPromo from './HeladosSemanaPromo';
import ProductBuilderModal from './ProductBuilderModal';
import ToppisDelDiaPanel, { ToppisDelDiaData } from './ToppisDelDiaPanel';
import { useCartFeedback } from '../hooks/useCartFeedback';
import { useQuickAddCombo } from '../hooks/useQuickAddCombo';
import ExperienceSectionFallback from './ExperienceSectionFallback';
import { resolveCartStock } from '../lib/cartHelpers';
import { toCLP } from '../lib/money';

type ComboItem = {
  nombre: string;
  badge?: string;
  concepto?: string;
  descripcion_corta?: string;
  gradient?: string;
  idproducto?: number | null;
  precio_desde?: number | null;
  imagen_url?: string | null;
  quick_add?: boolean;
};

type BaseCfg = {
  nombre?: string;
  label?: string;
  idproducto?: number | null;
  precio_desde?: number | null;
  precios?: number[];
  imagen_url?: string | null;
  tagline?: string;
  badge?: string;
};

type HeladosCombosData = {
  title: string;
  tagline: string;
  subtitle: string;
  combos: ComboItem[];
  combos_rotativos: ComboItem[];
  yogen: BaseCfg;
  soft?: BaseCfg;
  artesanal?: BaseCfg;
  toppis_del_dia?: ToppisDelDiaData;
};

const NAV_ITEMS = [
  {
    id: 'helados-predisenados',
    short: 'Combo yogurt',
    sub: 'Desde $2.990',
    tone: 'fuchsia' as const,
    recommended: true,
  },
  { id: 'base-soft', short: 'Helado soft', sub: '$1.000', tone: 'slate' as const, recommended: false },
  { id: 'base-yogen', short: 'Helado yogurt', sub: '$2.800', tone: 'emerald' as const, recommended: false },
  { id: 'base-artesanal', short: 'Helado artesanal', sub: '$2.000', tone: 'amber' as const, recommended: false },
];

const NAV_TONE: Record<(typeof NAV_ITEMS)[number]['tone'], string> = {
  fuchsia:
    'border-fuchsia-200/70 bg-gradient-to-b from-fuchsia-50/90 to-white text-fuchsia-950 hover:border-fuchsia-300 hover:shadow-glow-rose',
  slate:
    'border-slate-200/70 bg-gradient-to-b from-slate-50/90 to-white text-slate-900 hover:border-slate-300',
  emerald:
    'border-emerald-200/70 bg-gradient-to-b from-emerald-50/90 to-white text-emerald-950 hover:border-emerald-300',
  amber:
    'border-amber-200/70 bg-gradient-to-b from-amber-50/90 to-white text-amber-950 hover:border-amber-300',
};

function comboReferenceImage(nombre: string): string {
  const n = nombre.toLowerCase();
  if (n.includes('biscoff')) return '/images/helados/copa-biscoff.png';
  if (n.includes('antioxidante') || n.includes('tropical toppi')) return '/images/helados/copa-tropical.png';
  if (n.includes('cheesecake') || n.includes('berries toppi')) return '/images/helados/copa-berries.png';
  if (n.includes('chocobomba')) return '/images/helados/chocobomba.png';
  if (n.includes('tropical crunch')) return '/images/helados/tropical.png';
  if (n.includes('berry queen')) return '/images/helados/berry-queen.png';
  if (n.includes('galleta lovers')) return '/images/helados/galleta-lovers.png';
  if (n.includes('fit fresh')) return '/images/helados/fit-fresh.png';
  if (n.includes('mega antojo')) return '/images/helados/mega-antojo.png';
  return '/images/helados/yogen-mix.png';
}

function ComboImagePanel({
  combo,
  featured,
  children,
}: {
  combo: ComboItem;
  featured?: boolean;
  children?: ReactNode;
}) {
  const fallback = comboReferenceImage(combo.nombre);
  const preferred = combo.imagen_url ?? fallback;
  const [src, setSrc] = useState(preferred || fallback);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(preferred || fallback);
    setFailed(false);
  }, [preferred, fallback]);

  const handleError = () => {
    if (src !== fallback && fallback) {
      setSrc(fallback);
      return;
    }
    setFailed(true);
  };

  return (
    <div className={`relative w-full shrink-0 overflow-hidden bg-[#1a0812] ${featured ? 'h-48 sm:h-52' : 'h-44'}`}>
      {!failed ? (
        <>
          <Image
            src={src}
            alt={combo.nombre}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 768px) 280px, (max-width: 1024px) 50vw, 33vw"
            onError={handleError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120810] via-[#120810]/35 to-amber-900/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(251,191,36,0.12),transparent_55%)]" />
        </>
      ) : (
        <div className={`h-full bg-gradient-to-br ${combo.gradient ?? 'from-fuchsia-900 to-violet-950'}`} />
      )}
      {children}
    </div>
  );
}

const SCROLL_MT = 'scroll-mt-40 sm:scroll-mt-44';

function scrollToHeladosHash(hash: string) {
  const id = hash.replace(/^#/, '');
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
}

function HeladosSectionNav({ isPage }: { isPage: boolean }) {
  if (!isPage) return null;

  return (
    <nav
      aria-label="Tipos de helado"
      className="sticky top-[4.25rem] z-30 mb-8 rounded-[1.35rem] border border-white/80 bg-white/85 p-2.5 shadow-premium backdrop-blur-xl sm:top-[4.5rem]"
    >
      <p className="premium-kicker mb-2.5 text-center">Salto rápido</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`relative flex min-h-[48px] flex-col items-center justify-center rounded-2xl border px-2 py-3 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium sm:py-3.5 ${NAV_TONE[item.tone]} ${
              item.recommended ? 'ring-2 ring-fuchsia-400/50 ring-offset-1' : ''
            }`}
          >
            {item.recommended && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-fuchsia-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-white">
                Top
              </span>
            )}
            <span className="text-xs font-extrabold tracking-tight sm:text-sm">{item.short}</span>
            <span className="mt-0.5 text-[10px] font-medium opacity-70">{item.sub}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

function ComboCard({
  combo,
  featured,
  onOrder,
  loadingId,
}: {
  combo: ComboItem;
  featured?: boolean;
  onOrder: (id: number) => void;
  loadingId?: number | null;
}) {
  const price = combo.precio_desde;
  const canOrder = Boolean(combo.idproducto);
  const isLoading = loadingId === combo.idproducto;

  return (
    <article
      className={`group relative flex shrink-0 snap-start snap-always flex-col overflow-hidden rounded-[1.35rem] border transition-all duration-500 hover:-translate-y-1 w-[min(82vw,280px)] sm:w-[260px] md:w-full md:max-w-none ${
        featured
          ? 'border-fuchsia-400/50 shadow-premium-lg shadow-fuchsia-900/20 ring-2 ring-toppis-mustard/40 sm:w-[300px] md:w-full'
          : 'border-white/10 shadow-premium hover:border-fuchsia-400/25 hover:shadow-premium-lg'
      }`}
    >
      <ComboImagePanel combo={combo} featured={featured}>
        {featured && (
          <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-200 backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
            Favorito Toppi&apos;s
          </span>
        )}
        {combo.badge && !featured && (
          <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-toppis-mustard/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-ink shadow-sm">
            {combo.badge}
          </span>
        )}
      </ComboImagePanel>

      <div className="flex flex-1 flex-col bg-gradient-to-b from-[#1a0a14] to-[#0f172a] p-4 text-white">
        <h3 className="font-display text-lg font-extrabold leading-tight tracking-tight">{combo.nombre}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-white/70">{combo.descripcion_corta}</p>
        {price != null && (
          <div className="mt-3">
            <p className="font-display text-2xl font-extrabold tabular-nums text-white">{toCLP(price)}</p>
            <p className="mt-0.5 text-[10px] font-medium text-emerald-300/90">
              Fruta + salsa incluidas · sin sorpresas
            </p>
          </div>
        )}
        <button
          type="button"
          disabled={!canOrder || isLoading}
          onClick={() => combo.idproducto && onOrder(combo.idproducto)}
          className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-bold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
            featured
              ? 'bg-toppis-mustard text-brand-ink shadow-amber-900/30 hover:bg-toppis-mustard-hover'
              : 'bg-white text-fuchsia-950 shadow-inner-soft hover:bg-fuchsia-50'
          }`}
        >
          {isLoading
            ? 'Agregando…'
            : canOrder
              ? combo.quick_add
                ? featured
                  ? 'Agregar al carrito'
                  : 'Agregar combo'
                : featured
                  ? 'Quiero este'
                  : 'Pedir helado'
              : 'Próximamente'}
          {canOrder && !isLoading && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </article>
  );
}

type BaseKind = 'soft' | 'yogen' | 'artesanal';

const BASE_META: Record<
  BaseKind,
  {
    icon: typeof Zap;
    title: string;
    hook: string;
    detail: string;
    priceLine: string;
    tier: string;
    benefit: string;
    accentBar: string;
    iconWrap: string;
    iconColor: string;
    btn: string;
  }
> = {
  soft: {
    icon: Zap,
    title: 'Helado soft',
    hook: 'Rápido y clásico',
    detail: 'Vainilla, chocolate o sabor mixto',
    priceLine: 'Cono $1.000 · grande $1.800',
    tier: 'Entrada',
    benefit: 'Ideal si quieres algo ligero y barato',
    accentBar: 'bg-gradient-to-r from-slate-400 via-slate-600 to-slate-400',
    iconWrap: 'bg-slate-100 ring-slate-200/80',
    iconColor: 'text-slate-700',
    btn: 'bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-900/20',
  },
  yogen: {
    icon: Sparkles,
    title: 'Helado de yogurt',
    hook: 'Fresco con fruta',
    detail: 'Eliges sabor, fruta y salsa',
    priceLine: 'Desde $2.800',
    tier: 'Equilibrado',
    benefit: 'El punto medio: sabor + fruta real',
    accentBar: 'bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400',
    iconWrap: 'bg-emerald-50 ring-emerald-200/80',
    iconColor: 'text-emerald-700',
    btn: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-900/20',
  },
  artesanal: {
    icon: Crown,
    title: 'Helado artesanal',
    hook: 'Cremoso en bolas',
    detail: 'Eliges sabor · 1 o 2 bolas',
    priceLine: '1 bola $2.000 · 2 bolas $3.500',
    tier: 'Premium',
    benefit: 'Para cuando quieres algo más indulgente',
    accentBar: 'bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400',
    iconWrap: 'bg-amber-50 ring-amber-200/80',
    iconColor: 'text-amber-800',
    btn: 'bg-amber-800 hover:bg-amber-900 text-white shadow-lg shadow-amber-900/20',
  },
};

function BaseChoiceCard({
  kind,
  data,
  anchorId,
  onSelect,
}: {
  kind: BaseKind;
  data: BaseCfg;
  anchorId: string;
  onSelect: (id: number) => void;
}) {
  const meta = BASE_META[kind];
  const Icon = meta.icon;
  const canOrder = Boolean(data.idproducto);
  const price = data.precio_desde;

  return (
    <article
      id={anchorId}
      className={`glass-panel group ${SCROLL_MT} flex h-full flex-col overflow-hidden rounded-[1.35rem] transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg`}
    >
      <div className={`h-1 ${meta.accentBar}`} />

      {data.imagen_url ? (
        <div className="relative h-36 w-full overflow-hidden">
          <Image
            src={data.imagen_url}
            alt={meta.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
        </div>
      ) : (
        <div className="h-3" />
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${meta.iconWrap}`}
            >
              <Icon className={`h-5 w-5 ${meta.iconColor}`} />
            </span>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-muted">{meta.tier}</span>
              <h3 className="font-display text-lg font-extrabold tracking-tight text-brand-ink">{meta.title}</h3>
              <p className="text-xs font-medium text-brand-muted">{meta.hook}</p>
            </div>
          </div>
          {price != null && (
            <p className="shrink-0 text-right">
              <span className="block text-[9px] font-bold uppercase tracking-wide text-brand-muted">Desde</span>
              <span className="font-display text-base font-extrabold tabular-nums text-brand-primary">
                {toCLP(price)}
              </span>
            </p>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-brand-muted">{data.label ?? meta.detail}</p>
        <p className="mt-2 text-xs font-medium text-brand-ink/75">{meta.benefit}</p>

        <p className="mt-3 inline-flex w-fit rounded-full border border-slate-200/80 bg-slate-50/80 px-3 py-1 text-[11px] font-semibold text-brand-ink">
          {meta.priceLine}
        </p>

        {canOrder ? (
          <button
            type="button"
            onClick={() => onSelect(data.idproducto!)}
            className={`mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3.5 text-sm font-bold transition ${meta.btn}`}
          >
            Pedir {meta.title.toLowerCase()}
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <span className="mt-5 block rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-brand-muted">
            Próximamente
          </span>
        )}
      </div>
    </article>
  );
}

function SectionDivider() {
  return (
    <div className="relative my-12 flex items-center gap-4 px-2">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-slate-300/50" />
      <span className="shrink-0 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-brand-muted shadow-sm">
        O arma el tuyo
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-200 to-slate-300/50" />
    </div>
  );
}

export default function HeladosCombosSection({ variant = 'home' }: { variant?: 'home' | 'page' }) {
  const [data, setData] = useState<HeladosCombosData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [builderProductId, setBuilderProductId] = useState<number | null>(null);
  const [pendingCoupon, setPendingCoupon] = useState<string | null>(null);
  const { addWithFeedback } = useCartFeedback();
  const { quickAddOrOpen, loadingId } = useQuickAddCombo(setBuilderProductId);
  const router = useRouter();
  const isPage = variant === 'page';

  const loadData = () => {
    setLoading(true);
    setFetchError(false);
    fetch('/api/tienda/experiencias-home')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((json) => setData(json.helados_combos ?? null))
      .catch(() => {
        setData(null);
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (loading || !data) return;

    const scrollFromHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (!hash) return;
      window.setTimeout(() => scrollToHeladosHash(hash), 80);
    };

    scrollFromHash();
    window.addEventListener('hashchange', scrollFromHash);
    return () => window.removeEventListener('hashchange', scrollFromHash);
  }, [loading, data]);


  if (loading || fetchError || !data) {
    return (
      <ExperienceSectionFallback
        loading={loading}
        error={fetchError}
        empty={!loading && !fetchError && !data}
        onRetry={loadData}
      />
    );
  }

  const yogen = data.yogen;
  const soft = data.soft;
  const artesanal = data.artesanal;
  const hasBases = Boolean(soft || yogen?.idproducto || artesanal);

  return (
    <section
      id="helados-combos-estrella"
      className={`relative mx-auto scroll-mt-24 ${
        isPage
          ? 'premium-experience-section premium-experience-section--helados mb-8 max-w-7xl'
          : 'mb-4 max-w-7xl overflow-hidden rounded-[1.65rem] border border-toppis-mustard/30 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 px-3 py-6 shadow-premium sm:px-5 sm:py-8'
      }`}
    >
      {isPage && (
        <>
          <div className="pointer-events-none absolute -left-16 top-8 h-48 w-48 rounded-full bg-fuchsia-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 top-32 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
        </>
      )}

      <div className="relative mb-4">
        {!isPage && (
          <>
            <span className="premium-kicker mb-2 inline-flex items-center gap-2 rounded-full border border-toppis-mustard/30 bg-toppis-ink px-3 py-1 text-toppis-mustard">
              <IceCream className="h-3.5 w-3.5" />
              Helados · DondeMorales
            </span>
            <h2 className="premium-heading">Helados de yogurt, soft y artesanal</h2>
            <p className="mt-1 max-w-2xl text-sm text-brand-muted">
              Combo de helado de yogurt desde $2.990 · o arma helado soft, de yogurt o artesanal desde $1.000
            </p>
            <Link
              href="/helados"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-primary transition hover:gap-2"
            >
              Ver menú completo
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </>
        )}
      </div>

      <HeladosSectionNav isPage={isPage} />

      <div className="relative mb-8">
        <HeladosSemanaPromo
          compact
          onOrderCombo={(id, coupon) => {
            setPendingCoupon(coupon);
            setBuilderProductId(id);
          }}
        />
      </div>

      {/* Combos prediseñados */}
      <div id="helados-predisenados" className={SCROLL_MT}>
        <div className="premium-section-head mb-5">
          <span className="premium-kicker">Selección destacada</span>
          <h2 className="premium-heading">Combos de helado de yogurt</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-brand-muted">
            Sin pensar demasiado: eliges cuál quieres y listo. Fruta y salsa ya van incluidas.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-200/80 bg-fuchsia-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-fuchsia-800">
              <Star className="h-3 w-3 fill-fuchsia-600 text-fuchsia-600" />
              Recomendado
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white px-3 py-1 text-[10px] font-semibold text-brand-muted">
              <Users className="h-3 w-3" />
              El camino más rápido al checkout
            </span>
          </div>
        </div>

        <div className="section-shine relative overflow-hidden rounded-[1.75rem] border border-fuchsia-500/15 bg-gradient-to-br from-[#1a0a14] via-[#2d1020] to-[#0f172a] p-4 shadow-premium-lg ring-1 ring-fuchsia-500/10 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-500/8 blur-3xl" />

          <p className="scroll-hint-mobile text-white/45">Desliza para ver más copas →</p>
          <div className="combo-cards-row premium-scroll-fade relative">
            {data.combos.map((combo, i) => (
              <ComboCard key={combo.nombre} combo={combo} featured={i === 0} onOrder={quickAddOrOpen} loadingId={loadingId} />
            ))}
          </div>

          {data.combos_rotativos?.length > 0 && (
            <>
              <p className="relative mb-3 mt-7 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                <Clock className="h-3 w-3" />
                Rotación limitada
              </p>
              <div className="combo-cards-row premium-scroll-fade relative">
                {data.combos_rotativos.map((combo) => (
                  <ComboCard key={combo.nombre} combo={combo} onOrder={quickAddOrOpen} loadingId={loadingId} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {hasBases && (
        <>
          <SectionDivider />

          <div id="helados-disenados" className={SCROLL_MT}>
            <div className="premium-section-head mb-6">
              <span className="premium-kicker">Personaliza</span>
              <h2 className="premium-heading">Arma tu helado</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-brand-muted">
                Tres estilos, un solo clic. Empieza por el que más te tiente.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {soft && (
                <BaseChoiceCard kind="soft" data={soft} anchorId="base-soft" onSelect={setBuilderProductId} />
              )}
              {yogen?.idproducto && (
                <BaseChoiceCard kind="yogen" data={yogen} anchorId="base-yogen" onSelect={setBuilderProductId} />
              )}
              {artesanal && (
                <BaseChoiceCard
                  kind="artesanal"
                  data={artesanal}
                  anchorId="base-artesanal"
                  onSelect={setBuilderProductId}
                />
              )}
            </div>
          </div>
        </>
      )}

      <ToppisDelDiaPanel data={data.toppis_del_dia} variant="banner" />

      {builderProductId && (
        <ProductBuilderModal
          productId={builderProductId}
          onClose={() => {
            setBuilderProductId(null);
            setPendingCoupon(null);
          }}
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
            const coupon = pendingCoupon;
            setBuilderProductId(null);
            setPendingCoupon(null);
            if (coupon) {
              router.push(`/checkout?coupon=${encodeURIComponent(coupon)}`);
            }
          }}
        />
      )}
    </section>
  );
}
