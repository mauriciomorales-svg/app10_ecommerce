'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CalendarCheck,
  ChevronRight,
  Flame,
  Gift,
  IceCream,
  Loader2,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import ProductBuilderModal from './ProductBuilderModal';
import type { PackComponentePreview } from './PackComponentesPreview';
import PackShareActions from './PackShareActions';
import { usePackFavoritos } from '../hooks/usePackFavoritos';
import { useCartFeedback } from '../hooks/useCartFeedback';
import { useQuickAddCombo } from '../hooks/useQuickAddCombo';
import { resolveCartStock } from '../lib/cartHelpers';
import { toCLP } from '../lib/money';
import { packReferenceImage, SECCION_THEME } from '../lib/packReservaImages';

type FlujoPaso = { paso: number; titulo: string; texto: string };

type PackItem = {
  nombre: string;
  nombre_publico?: string;
  modalidad_label?: string;
  badge?: string;
  descripcion_corta?: string;
  gradient?: string;
  imagen_url?: string | null;
  idproducto?: number | null;
  precio_desde?: number | null;
  siempre_incluye?: string[];
  tu_eliges?: { grupo: string; tipo: string; opciones: string[] }[];
  ocasion?: string;
  tarjeta_personalizable?: boolean;
  destacado?: boolean;
};

type HeladoListo = {
  nombre: string;
  nombre_publico?: string;
  badge?: string;
  descripcion_corta?: string;
  imagen_url?: string | null;
  idproducto?: number | null;
  precio_desde?: number | null;
  quick_add?: boolean;
  combo_cerrado?: boolean;
};

type RegaloCerrado = HeladoListo & {
  siempre_incluye?: string[];
  ocasion?: string;
  componentes_preview?: PackComponentePreview[];
};

type ConfianzaItem = { icon?: string; texto: string };

type Seccion = {
  id: string;
  titulo: string;
  subtitulo?: string;
  gradient?: string;
  items: PackItem[];
};

type PacksReservaData = {
  title: string;
  tagline: string;
  subtitle: string;
  flujo: FlujoPaso[];
  confianza?: ConfianzaItem[];
  helados_listos?: HeladoListo[];
  regalos_cerrados?: RegaloCerrado[];
  secciones: Seccion[];
};

const REGALO_OCASION: { id: string; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'desayuno', label: 'Desayuno' },
  { id: 'once', label: 'Once' },
  { id: 'cumpleanos', label: 'Cumpleaños' },
  { id: 'para_mama', label: 'Para mamá' },
  { id: 'amor', label: 'Amor' },
  { id: 'condolencias', label: 'Condolencias' },
  { id: 'corporativo', label: 'Corporativo' },
  { id: 'gift', label: 'Gift helado' },
];

const CONFIANZA_ICON: Record<string, typeof ShieldCheck> = {
  shield: ShieldCheck,
  calendar: CalendarCheck,
  gift: Gift,
  truck: Truck,
};

const SECCION_ICON: Record<string, typeof IceCream> = {
  helados: IceCream,
  comida: Flame,
  regalos: Gift,
};

const SECCION_BG: Record<string, { src: string; alt: string }> = {
  helados: { src: '/images/hero-toppis.png', alt: 'Fondo helados Toppi\'s' },
  comida: { src: '/images/hero-salada.png', alt: 'Comida Toppi\'s — DondeMorales' },
  regalos: { src: '/images/hero-regalos.png', alt: 'Fondo canastas regalo' },
};

function PackImagePanel({
  item,
  seccionId,
  children,
}: {
  item: PackItem;
  seccionId: string;
  children?: ReactNode;
}) {
  const titulo = item.nombre_publico || item.nombre;
  const fallback = packReferenceImage(item.nombre, seccionId);
  const preferred = item.imagen_url ?? fallback;
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
    <div className="relative h-48 w-full shrink-0 overflow-hidden bg-[#1a0812] sm:h-52">
      {!failed ? (
        <>
          <Image
            src={src}
            alt={titulo}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={handleError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120810] via-[#120810]/40 to-amber-900/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(251,191,36,0.14),transparent_55%)]" />
        </>
      ) : (
        <div className={`h-full bg-gradient-to-br ${item.gradient ?? 'from-brand-primary/80 to-brand-success/70'}`} />
      )}
      {children}
    </div>
  );
}

function PackChoiceChips({
  fijos,
  grupos,
}: {
  fijos: string[];
  grupos: { grupo: string; tipo: string; opciones: string[] }[];
}) {
  const chips: string[] = [];

  if (fijos.length > 0) {
    chips.push(fijos.slice(0, 2).join(' · '));
  }

  for (const g of grupos.slice(0, 4)) {
    chips.push(g.grupo);
  }

  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <span
          key={chip}
          className="inline-flex max-w-full truncate rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/80 backdrop-blur-sm"
        >
          {chip}
        </span>
      ))}
      {grupos.length > 4 && (
        <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-200">
          +{grupos.length - 4} más
        </span>
      )}
    </div>
  );
}

function PackCard({
  item,
  seccionId,
  onReserve,
}: {
  item: PackItem;
  seccionId: string;
  onReserve: (id: number) => void;
}) {
  const canReserve = Boolean(item.idproducto);
  const titulo = item.nombre_publico || item.nombre;
  const fijos = item.siempre_incluye ?? [];
  const grupos = item.tu_eliges ?? [];
  const theme = SECCION_THEME[seccionId] ?? SECCION_THEME.helados;
  const featured = Boolean(item.destacado);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[1.35rem] border bg-[#0f172a] shadow-premium transition-all duration-500 hover:-translate-y-1 hover:shadow-premium-lg ${theme.cardBorder} ${theme.cardHover} ${
        featured ? 'ring-2 ring-toppis-mustard/50 ring-offset-2 ring-offset-white/80' : ''
      }`}
    >
      <PackImagePanel item={item} seccionId={seccionId}>
        {featured && (
          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-200 backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
            Favorito
          </span>
        )}
        {item.badge && (
          <span className={`absolute z-10 inline-flex items-center gap-1 rounded-full bg-toppis-mustard/95 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-ink shadow-sm ${
            featured ? 'right-3 top-3' : 'right-3 top-3'
          }`}>
            {item.badge}
          </span>
        )}
        {item.modalidad_label && (
          <span className="absolute bottom-3 left-3 z-10 max-w-[85%] truncate rounded-full bg-black/55 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-md">
            {item.modalidad_label}
          </span>
        )}
      </PackImagePanel>

      <div className="flex flex-1 flex-col bg-gradient-to-b from-[#1a0a14] to-[#0f172a] p-4 text-white">
        <h3 className="font-display text-lg font-extrabold leading-tight tracking-tight">{titulo}</h3>
        <p className="mt-2 flex-1 text-xs leading-relaxed text-white/70">{item.descripcion_corta}</p>

        <PackChoiceChips fijos={fijos} grupos={grupos} />

        {item.tarjeta_personalizable && (
          <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-200/90">
            <Gift className="h-3 w-3" />
            Tarjeta de saludo incluida · escribe tu mensaje al reservar
          </p>
        )}

        {item.precio_desde != null && (
          <div className="mt-3">
            <p className="font-display text-2xl font-extrabold tabular-nums text-white">
              desde {toCLP(item.precio_desde)}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-emerald-300/90">
              {seccionId === 'regalos'
                ? 'Envío gratis Renaico · tarjeta personalizable'
                : 'Personalizas antes de pagar · retiro Santiago Watt 205, Renaico'}
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={!canReserve}
          onClick={() => item.idproducto && onReserve(item.idproducto)}
          className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-3.5 text-sm font-bold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
            featured
              ? 'bg-toppis-mustard text-brand-ink shadow-amber-900/30 hover:bg-toppis-mustard-hover'
              : `text-white ${theme.btn}`
          }`}
        >
          {canReserve ? (featured ? 'Reservar estrella' : 'Reservar y personalizar') : 'Próximamente'}
          {canReserve && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </article>
  );
}

function ConfianzaStrip({ items }: { items: ConfianzaItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = CONFIANZA_ICON[item.icon ?? ''] ?? ShieldCheck;
        return (
          <div
            key={item.texto}
            className="flex items-start gap-2 rounded-xl border border-emerald-100/80 bg-white/90 px-3 py-2.5 shadow-sm"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
            <p className="text-[11px] font-medium leading-snug text-brand-ink">{item.texto}</p>
          </div>
        );
      })}
    </div>
  );
}

function HeladosListosStrip({
  combos,
  onOrder,
  loadingId,
}: {
  combos: HeladoListo[];
  onOrder: (id: number) => void;
  loadingId: number | null;
}) {
  if (combos.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="premium-kicker text-fuchsia-700">Combos listos</p>
          <h3 className="font-display text-lg font-extrabold text-brand-ink">Prediseñados — menos pasos</h3>
          <p className="mt-0.5 text-xs text-brand-muted">Como en heladerías online: precio fijo, eliges poco o nada.</p>
        </div>
        <Link
          href="/helados#helados-predisenados"
          className="inline-flex items-center gap-1 text-xs font-bold text-fuchsia-700 hover:underline"
        >
          Ver todos en Helados
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 snap-x snap-mandatory">
        {combos.map((combo) => {
          const titulo = combo.nombre_publico || combo.nombre;
          const canOrder = Boolean(combo.idproducto);
          const img = combo.imagen_url ?? packReferenceImage(combo.nombre, 'helados');
          const isLoading = loadingId === combo.idproducto;
          return (
            <article
              key={combo.nombre}
              className="group flex w-[min(78vw,220px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-fuchsia-200/50 bg-[#0f172a] shadow-premium transition hover:-translate-y-0.5 sm:w-[200px]"
            >
              <div className="relative h-28 overflow-hidden">
                <Image src={img} alt={titulo} fill className="object-cover transition group-hover:scale-105" sizes="200px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120810] via-transparent to-transparent" />
                {combo.badge && (
                  <span className="absolute right-2 top-2 rounded-full bg-toppis-mustard/95 px-2 py-0.5 text-[8px] font-bold uppercase text-brand-ink">
                    {combo.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3 text-white">
                <h4 className="text-sm font-extrabold leading-tight">{titulo}</h4>
                <p className="mt-1 line-clamp-2 flex-1 text-[10px] text-white/65">{combo.descripcion_corta}</p>
                {combo.precio_desde != null && (
                  <p className="mt-2 font-display text-base font-extrabold tabular-nums">{toCLP(combo.precio_desde)}</p>
                )}
                <button
                  type="button"
                  disabled={!canOrder || isLoading}
                  onClick={() => combo.idproducto && onOrder(combo.idproducto)}
                  className="mt-2 w-full rounded-lg bg-white py-2 text-[11px] font-bold text-fuchsia-950 transition hover:bg-fuchsia-50 disabled:opacity-50"
                >
                  {isLoading
                    ? 'Agregando…'
                    : combo.quick_add
                      ? 'Agregar al carrito'
                      : canOrder
                        ? 'Personalizar'
                        : 'Próximamente'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function RegalosCerradosStrip({
  items,
  onOrder,
  loadingId,
  isFavorite,
  onToggleFavorite,
}: {
  items: RegaloCerrado[];
  onOrder: (id: number) => void;
  loadingId: number | null;
  isFavorite: (id?: number | null) => boolean;
  onToggleFavorite: (item: RegaloCerrado) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-3">
        <p className="premium-kicker text-rose-700">Packs cerrados</p>
        <h3 className="font-display text-lg font-extrabold text-brand-ink">Lista fija — 1 clic al carrito</h3>
        <p className="mt-0.5 text-xs text-brand-muted">Lo que ves en “Incluye” es lo que recibes. Sin armador.</p>
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 snap-x snap-mandatory">
        {items.map((item) => {
          const titulo = item.nombre_publico || item.nombre;
          const canOrder = Boolean(item.idproducto);
          const img = item.imagen_url ?? packReferenceImage(item.nombre, 'regalos');
          const isLoading = loadingId === item.idproducto;
          return (
            <article
              key={item.nombre}
              className="group flex w-[min(78vw,240px)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-rose-200/60 bg-[#0f172a] shadow-premium sm:w-[220px]"
            >
              <div className="relative h-28 overflow-hidden">
                <Image src={img} alt={titulo} fill className="object-cover transition group-hover:scale-105" sizes="220px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120810] via-transparent to-transparent" />
                {item.badge && (
                  <span className="absolute right-2 top-2 rounded-full bg-rose-500/90 px-2 py-0.5 text-[8px] font-bold uppercase text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-3 text-white">
                <h4 className="text-sm font-extrabold leading-tight">{titulo}</h4>
                <p className="mt-1 line-clamp-2 flex-1 text-[10px] text-white/65">{item.descripcion_corta}</p>
                {item.siempre_incluye && item.siempre_incluye.length > 0 && (
                  <p className="mt-1 line-clamp-2 text-[9px] text-emerald-200/80">
                    {item.siempre_incluye.slice(0, 3).join(' · ')}
                  </p>
                )}
                {item.precio_desde != null && (
                  <p className="mt-2 font-display text-base font-extrabold tabular-nums">{toCLP(item.precio_desde)}</p>
                )}
                {item.idproducto && (
                  <PackShareActions
                    pack={{
                      nombre: item.nombre,
                      precio: item.precio_desde,
                      siempre_incluye: item.siempre_incluye,
                      idproducto: item.idproducto,
                      ocasion: item.ocasion,
                    }}
                    isFavorite={isFavorite(item.idproducto)}
                    onToggleFavorite={() => onToggleFavorite(item)}
                    variant="dark"
                    compact
                  />
                )}
                <button
                  type="button"
                  disabled={!canOrder || isLoading}
                  onClick={() => item.idproducto && onOrder(item.idproducto)}
                  className="mt-2 w-full rounded-lg bg-white py-2 text-[11px] font-bold text-rose-950 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  {isLoading ? 'Agregando…' : canOrder ? 'Agregar al carrito' : 'Próximamente'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function RegaloOccasionFilter({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {REGALO_OCASION.map((o) => {
        const selected = active === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
              selected
                ? 'border-rose-500 bg-rose-600 text-white shadow-md'
                : 'border-rose-200/80 bg-white/90 text-rose-900 hover:border-rose-300'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function FlujoStrip({ pasos }: { pasos: FlujoPaso[] }) {
  if (pasos.length === 0) return null;

  return (
    <div className="mb-8 grid gap-3 sm:grid-cols-3">
      {pasos.map((p) => (
        <div
          key={p.paso}
          className="glass-panel rounded-[1.15rem] px-4 py-4 text-left ring-1 ring-brand-primary/10 transition hover:-translate-y-0.5 hover:shadow-premium"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Paso {p.paso}</p>
          <p className="mt-1 text-sm font-bold text-brand-ink">{p.titulo}</p>
          <p className="mt-0.5 text-xs text-brand-muted">{p.texto}</p>
        </div>
      ))}
    </div>
  );
}

export default function PacksReservaSection() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<PacksReservaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('helados');
  const [regaloOcasion, setRegaloOcasion] = useState<string>('todos');
  const [builderProductId, setBuilderProductId] = useState<number | null>(null);
  const { addWithFeedback } = useCartFeedback();
  const { quickAddOrOpen, loadingId } = useQuickAddCombo(setBuilderProductId);
  const { isFavorite, toggleFavorite } = usePackFavoritos();

  useEffect(() => {
    fetch('/api/tienda/experiencias-home')
      .then((r) => r.json())
      .then((json) => {
        const block = json.packs_reserva as PacksReservaData | undefined;
        setData(block ?? null);
        const ocasionFromUrl = searchParams.get('ocasion');
        if (ocasionFromUrl) {
          setActiveSection('regalos');
          setRegaloOcasion(ocasionFromUrl);
        } else if (block?.secciones?.[0]?.id) {
          setActiveSection(block.secciones[0].id);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [searchParams]);

  useEffect(() => {
    const syncFromHash = () => {
      const id = window.location.hash.replace(/^#packs-/, '');
      if (id && data?.secciones.some((s) => s.id === id)) {
        setActiveSection(id);
      }
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="py-12 text-center text-sm text-brand-muted">
        No pudimos cargar las canastas y combos.{' '}
        <Link href="/" className="font-semibold text-brand-primary underline">
          Volver al inicio
        </Link>
      </p>
    );
  }

  const seccionActiva = data.secciones.find((s) => s.id === activeSection) ?? data.secciones[0];
  const theme = SECCION_THEME[seccionActiva?.id ?? 'helados'] ?? SECCION_THEME.helados;

  const itemsVisibles = (() => {
    if (!seccionActiva) return [];
    let items = [...seccionActiva.items];
    if (seccionActiva.id === 'regalos' && regaloOcasion !== 'todos') {
      items = items.filter((i) => i.ocasion === regaloOcasion);
    }
    items.sort((a, b) => Number(Boolean(b.destacado)) - Number(Boolean(a.destacado)));
    return items;
  })();

  return (
    <>
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="mb-6 rounded-[1.35rem] border border-brand-primary/15 bg-gradient-to-br from-emerald-50/90 via-white to-rose-50/60 p-4 shadow-premium sm:p-5">
          <div className="flex flex-wrap items-start gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-md shadow-brand-primary/25">
              <CalendarCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-brand-ink">{data.subtitle}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-muted">
                <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
                Pago online = reserva confirmada · retiro Santiago Watt 205, Renaico
              </p>
            </div>
            <Link
              href="/cart"
              className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-brand-primary/20 bg-white px-3 py-2 text-xs font-bold text-brand-primary shadow-sm hover:bg-emerald-50"
            >
              Ver carrito
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="https://wa.me/56975647756?text=Hola%2C%20tengo%20una%20duda%20sobre%20packs%20en%20dondemorales.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-100"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </div>
        </div>

        <ConfianzaStrip items={data.confianza ?? []} />

        <FlujoStrip pasos={data.flujo} />

        <div className="premium-chip-row mb-5">
          {data.secciones.map((s) => {
            const Icon = SECCION_ICON[s.id] ?? Package;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActiveSection(s.id);
                  if (s.id !== 'regalos') setRegaloOcasion('todos');
                  window.history.replaceState(null, '', `#packs-${s.id}`);
                }}
                className={`premium-chip inline-flex items-center gap-1.5 ${
                  active
                    ? 'border-brand-primary bg-brand-primary text-white shadow-md'
                    : 'premium-chip-idle hover:border-brand-primary/40 hover:bg-emerald-50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {s.titulo}
              </button>
            );
          })}
        </div>

        {seccionActiva && (
          <section
            id={`packs-${seccionActiva.id}`}
            className={`relative scroll-mt-24 overflow-hidden rounded-[1.65rem] border pb-10 shadow-premium-lg ${theme.sectionBorder}`}
          >
            {SECCION_BG[seccionActiva.id] && (
              <>
                <div className="pointer-events-none absolute inset-0">
                  <Image
                    src={SECCION_BG[seccionActiva.id].src}
                    alt={SECCION_BG[seccionActiva.id].alt}
                    fill
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    className={`object-cover saturate-[1.12] ${theme.bgOpacity}`}
                  />
                </div>
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${theme.sectionTint}`} />
              </>
            )}
            <div className="relative z-10 px-3 pt-5 sm:px-5 sm:pt-6">
              <div className="premium-section-head mb-5">
                <span className={`premium-kicker ${theme.kicker}`}>Reserva online</span>
                <h2 className="premium-heading">{seccionActiva.titulo}</h2>
                {seccionActiva.subtitulo && (
                  <p className="mt-1 text-sm text-brand-muted">{seccionActiva.subtitulo}</p>
                )}
              </div>

              {seccionActiva.id === 'helados' && (data.helados_listos?.length ?? 0) > 0 && (
                <HeladosListosStrip
                  combos={data.helados_listos ?? []}
                  onOrder={quickAddOrOpen}
                  loadingId={loadingId}
                />
              )}

              {seccionActiva.id === 'regalos' && (data.regalos_cerrados?.length ?? 0) > 0 && (
                <RegalosCerradosStrip
                  items={data.regalos_cerrados ?? []}
                  onOrder={quickAddOrOpen}
                  loadingId={loadingId}
                  isFavorite={isFavorite}
                  onToggleFavorite={(item) => {
                    if (!item.idproducto) return;
                    toggleFavorite({
                      idproducto: item.idproducto,
                      nombre: item.nombre,
                      precio: item.precio_desde,
                      imagen_url: item.imagen_url,
                      ocasion: item.ocasion,
                    });
                  }}
                />
              )}

              {seccionActiva.id === 'regalos' && (data.regalos_cerrados?.length ?? 0) > 0 && (
                <p className="premium-kicker mb-3 text-rose-700">Canastas personalizables</p>
              )}

              {seccionActiva.id === 'helados' && (data.helados_listos?.length ?? 0) > 0 && (
                <p className="premium-kicker mb-3 text-fuchsia-700">Arma tu helado</p>
              )}

              {seccionActiva.id === 'regalos' && (
                <RegaloOccasionFilter active={regaloOcasion} onChange={setRegaloOcasion} />
              )}

              {itemsVisibles.length === 0 ? (
                <p className="rounded-xl border border-rose-100 bg-white/80 px-4 py-8 text-center text-sm text-brand-muted">
                  No hay packs en esta ocasión.{' '}
                  <button type="button" className="font-semibold text-rose-700 underline" onClick={() => setRegaloOcasion('todos')}>
                    Ver todos
                  </button>
                </p>
              ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {itemsVisibles.map((item) => (
                  <PackCard
                    key={item.nombre}
                    item={item}
                    seccionId={seccionActiva.id}
                    onReserve={(id) => setBuilderProductId(id)}
                  />
                ))}
              </div>
              )}
            </div>
          </section>
        )}
      </div>

      {builderProductId != null && (
        <ProductBuilderModal
          productId={builderProductId}
          onClose={() => setBuilderProductId(null)}
          onAddToCart={(item) => {
            addWithFeedback({
              idproducto: item.idproducto,
              nombre: item.nombre,
              precio_venta: item.precio_venta,
              imagen: item.imagen || null,
              stock: resolveCartStock(99, item.bundle_configuration),
              pack_includes: item.pack_includes,
              bundle_configuration: item.bundle_configuration,
              idcategoria: item.idcategoria ?? null,
            });
            setBuilderProductId(null);
          }}
        />
      )}
    </>
  );
}
