'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Candy,
  Coffee,
  Croissant,
  Gift,
  Heart,
  Package,
  PartyPopper,
  Ribbon,
  ShoppingBag,
  Sparkles,
  Sticker,
  Tag,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import { toCLP } from '../lib/money';
import type { PackComponentePreview } from './PackComponentesPreview';
import PackShareActions from './PackShareActions';
import { usePackFavoritos } from '../hooks/usePackFavoritos';

export type PackPremiumItemVisual = {
  icon: string;
  label: string;
  tipo: 'producto' | 'empaque';
};

export type PackPremiumCardData = {
  nombre: string;
  badge?: string;
  badge_fecha?: string;
  tagline?: string;
  precio?: number | null;
  idproducto?: number | null;
  imagen_url?: string | null;
  gradient?: string;
  accent?: string;
  items_visual?: PackPremiumItemVisual[];
  siempre_incluye?: string[];
  componentes_preview?: PackComponentePreview[];
  ocasion?: string;
  spotlight?: boolean;
  coleccion?: string;
  a_pedido?: boolean;
  mas_pedido?: boolean;
};

const ICONS: Record<string, LucideIcon> = {
  pan: Croissant,
  cafe: Coffee,
  dulce: Candy,
  chocolate: Candy,
  bebida: Sparkles,
  te: Coffee,
  queso: Tag,
  jamon: Tag,
  cracker: Package,
  empaque: Gift,
  globo: PartyPopper,
  espumante: Wine,
  canasto: ShoppingBag,
  mug: Coffee,
  tarjeta: Heart,
  cinta: Ribbon,
  seda: Sparkles,
  sticker: Sticker,
  bolsa: ShoppingBag,
  snack: Box,
};

function ItemIcon({ icon }: { icon: string }) {
  const Icon = ICONS[icon] ?? Package;
  return <Icon className="h-4 w-4" strokeWidth={1.75} />;
}

function accentRing(accent?: string): string {
  switch (accent) {
    case 'amber':
      return 'ring-amber-400/30 shadow-amber-500/10';
    case 'violet':
      return 'ring-violet-400/30 shadow-violet-500/10';
    case 'emerald':
      return 'ring-emerald-400/30 shadow-emerald-500/10';
    case 'slate':
      return 'ring-blue-400/25 shadow-blue-500/10';
    default:
      return 'ring-rose-400/30 shadow-rose-500/10';
  }
}

/** Clases completas en código fuente para que Tailwind las incluya en el build */
const PACK_GRADIENT_CLASSES = {
  slate: 'from-slate-900 via-blue-950 to-indigo-950',
  amber: 'from-amber-950 via-orange-950 to-slate-950',
  emerald: 'from-emerald-950 via-teal-950 to-slate-950',
  rose: 'from-rose-950 via-pink-950 to-violet-950',
  violet: 'from-fuchsia-950 via-purple-950 to-violet-950',
  red: 'from-red-950 via-rose-950 to-amber-950',
  orange: 'from-red-950 via-orange-950 to-slate-950',
  lime: 'from-lime-950 via-emerald-950 to-teal-950',
  yellow: 'from-yellow-950 via-amber-950 to-orange-950',
  stone: 'from-stone-900 via-slate-900 to-zinc-950',
  pollo: 'from-amber-950 via-yellow-950 to-orange-950',
  pizza: 'from-rose-950 via-red-950 to-orange-950',
  mechada: 'from-amber-950 via-orange-950 to-red-950',
  churrasco: 'from-stone-900 via-amber-950 to-orange-950',
  default: 'from-rose-950 to-violet-950',
} as const;

function resolvePackGradient(pack: PackPremiumCardData): string {
  const g = pack.gradient?.trim();
  const known = Object.values(PACK_GRADIENT_CLASSES);
  if (g && known.includes(g as (typeof known)[number])) {
    return g;
  }
  switch (pack.accent) {
    case 'amber':
      return PACK_GRADIENT_CLASSES.amber;
    case 'emerald':
      return PACK_GRADIENT_CLASSES.emerald;
    case 'slate':
      return PACK_GRADIENT_CLASSES.slate;
    case 'orange':
    case 'red':
      return PACK_GRADIENT_CLASSES.orange;
    case 'lime':
      return PACK_GRADIENT_CLASSES.lime;
    case 'yellow':
      return PACK_GRADIENT_CLASSES.yellow;
    case 'violet':
      return PACK_GRADIENT_CLASSES.violet;
    default:
      return PACK_GRADIENT_CLASSES.default;
  }
}

function accentBadge(accent?: string): string {
  switch (accent) {
    case 'amber':
      return 'bg-amber-400/20 text-amber-100 ring-amber-300/30';
    case 'violet':
      return 'bg-violet-400/20 text-violet-100 ring-violet-300/30';
    case 'emerald':
      return 'bg-emerald-400/20 text-emerald-100 ring-emerald-300/30';
    case 'slate':
      return 'bg-blue-400/20 text-blue-100 ring-blue-300/30';
    default:
      return 'bg-rose-400/20 text-rose-100 ring-rose-300/30';
  }
}

function packReferenceImage(pack: PackPremiumCardData): string {
  const n = pack.nombre.toLowerCase();
  if (n.includes('papá completo') || n.includes('papa completo')) {
    return '/images/regalos/pack-papa-completo.png';
  }
  if (n.includes('papá premium') || n.includes('papa premium')) {
    return '/images/regalos/pack-papa-premium.png';
  }
  if (n.includes('papá bandeja') || n.includes('papa bandeja')) {
    return '/images/regalos/pack-papa-bandeja.png';
  }
  if (n.includes('combo papá cena') || n.includes('combo papa cena')) {
    return '/images/comida/combo-papa-cena-premium.png';
  }
  if (n.includes('chorrillana') && n.includes('helado')) {
    return '/images/comida/combo-papa-chorrillana.png';
  }
  if (n.includes('combo papá sushi') || n.includes('combo papa sushi')) {
    return '/images/comida/combo-papa-sushi.png';
  }
  if (n.includes('mechada')) return '/images/comida/combo-papa-mechada.png';
  if (n.includes('pollo asado')) return '/images/comida/combo-papa-pollo.png';
  if (n.includes('pizza familiar')) return '/images/comida/combo-papa-pizza.png';
  if (n.includes('fajitas')) return '/images/comida/combo-papa-fajitas.png';
  if (n.includes('combo papá completos') || n.includes('combo papa completos')) {
    return '/images/comida/combo-papa-completos.png';
  }
  if (n.includes('combo papá churrascos') || n.includes('combo papa churrascos')) {
    return '/images/comida/combo-papa-churrascos.png';
  }
  if (n.includes('día del padre') || n.includes('dia del padre')) {
    return '/images/regalos/pack-papa-premium.png';
  }
  if (n.includes('desayuno clásico')) return '/images/regalos/pack-desayuno-clasico.png';
  if (n.includes('cumpleaños')) return '/images/regalos/pack-cumpleanos-dulce.png';
  if (n.includes('amor')) return '/images/regalos/pack-amor-espumante.png';
  if (n.includes('once familiar')) return '/images/regalos/pack-once-familiar.png';
  if (n.includes('condolencias')) return '/images/regalos/pack-condolencias.png';
  if (n.includes('corporativo')) return '/images/regalos/pack-corporativo.png';
  return '/images/regalos/pack-regalo-marco.svg';
}

function PackImagePanel({
  pack,
  items,
  compact,
}: {
  pack: PackPremiumCardData;
  items: PackPremiumItemVisual[];
  compact?: boolean;
}) {
  const fallback = packReferenceImage(pack);
  const preferred = pack.imagen_url ?? fallback;
  const [src, setSrc] = useState(preferred || fallback);

  const handleError = () => {
    // No degradar a SVG placeholder — las fotos PNG son la referencia comercial.
    if (src !== fallback && fallback) {
      setSrc(fallback);
    }
  };

  const previewIcons = items.slice(0, 4);

  return (
    <div
      className={`relative overflow-hidden bg-slate-950/50 ${
        compact ? 'min-h-[200px]' : 'min-h-[220px] sm:min-h-[260px] lg:min-h-[340px]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(251,191,36,0.12),transparent_55%)]" />

      <div
        className={`absolute overflow-hidden rounded-2xl shadow-2xl ring-2 ring-amber-400/45 ring-offset-2 ring-offset-slate-950 ${
          compact ? 'inset-3' : 'inset-4 sm:inset-5 lg:inset-6'
        }`}
      >
        <Image
          src={src}
          alt={pack.nombre}
          fill
          className="object-cover object-center"
          sizes={compact ? '320px' : '(max-width: 1024px) 100vw, 45vw'}
          onError={handleError}
          priority={!compact && Boolean(pack.spotlight)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-amber-200/5" />
      </div>

      {previewIcons.length > 0 && !compact && (
        <div className="pointer-events-none absolute bottom-5 left-5 right-5 z-10 hidden flex-wrap justify-center gap-2 lg:flex">
          {previewIcons.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-medium text-white/85 ring-1 ring-white/15 backdrop-blur-sm"
            >
              <ItemIcon icon={item.icon} />
              <span className="max-w-[7rem] truncate">{item.label}</span>
            </span>
          ))}
        </div>
      )}

    </div>
  );
}

function resolvePackItems(pack: PackPremiumCardData): PackPremiumItemVisual[] {
  const visual = pack.items_visual ?? [];
  const fromApi = (pack.siempre_incluye ?? []).map((label) => ({
    icon: 'empaque',
    label,
    tipo: 'producto' as const,
  }));
  if (visual.length > 0 && fromApi.length > visual.length) {
    return fromApi;
  }
  if (visual.length > 0) return visual;
  return fromApi;
}

function ContentsGrid({ items }: { items: PackPremiumItemVisual[] }) {
  const productos = items.filter((i) => i.tipo === 'producto');
  const empaques = items.filter((i) => i.tipo === 'empaque');

  return (
    <div className="space-y-3">
      {productos.length > 0 && (
        <div>
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">
            Productos
          </p>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {productos.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 rounded-xl bg-white/[0.07] px-2.5 py-2 ring-1 ring-white/10"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-amber-200">
                  <ItemIcon icon={item.icon} />
                </span>
                <span className="text-[11px] font-medium leading-snug text-white/90">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {empaques.length > 0 && (
        <div>
          <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/45">
            Empaque incluido
          </p>
          <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {empaques.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-2.5 py-2 ring-1 ring-white/8"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/8 text-emerald-200/90">
                  <ItemIcon icon={item.icon} />
                </span>
                <span className="text-[11px] font-medium leading-snug text-white/75">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

type Props = {
  pack: PackPremiumCardData;
  variant?: 'spotlight' | 'card';
  /** En grilla de 3 columnas: imagen arriba, sin panel lateral vacío */
  compact?: boolean;
};

export default function PackPremiumCard({ pack, variant = 'card', compact = false }: Props) {
  const href = pack.idproducto ? `/producto/${pack.idproducto}` : '#';
  const { isFavorite, toggleFavorite } = usePackFavoritos();
  const fav = isFavorite(pack.idproducto);
  const items = resolvePackItems(pack);
  const isSpotlight = (variant === 'spotlight' || pack.spotlight) && !compact;
  const gradientClass = resolvePackGradient(pack);

  if (isSpotlight) {
    return (
      <article
        className={`relative overflow-hidden rounded-[1.75rem] bg-slate-950 bg-gradient-to-br ${gradientClass} shadow-2xl ring-1 ${accentRing(pack.accent)}`}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative grid gap-0 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <PackImagePanel pack={pack} items={items} />

          <div className="relative flex flex-col p-5 sm:p-6 lg:p-8">
            <div className="mb-3 hidden flex-wrap gap-2 lg:flex">
              {pack.mas_pedido && (
                <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-lg">
                  Recomendado
                </span>
              )}
              {pack.badge_fecha && (
                <span className="rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-lg">
                  {pack.badge_fecha}
                </span>
              )}
              {pack.badge && (
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${accentBadge(pack.accent)}`}>
                  {pack.badge}
                </span>
              )}
              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 ring-1 ring-white/15">
                {pack.a_pedido ? 'Cocina a pedido' : 'Pack cerrado'}
              </span>
            </div>

            <h3 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              {pack.nombre}
            </h3>
            {pack.tagline && (
              <p className="mt-1 text-sm font-medium text-white/65">{pack.tagline}</p>
            )}

            <div className="mt-4 flex-1">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/90">
                Este pack incluye
              </p>
              <ContentsGrid items={items} />
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              {pack.precio != null && (
                <p className="font-display text-3xl font-extrabold text-white">
                  {toCLP(pack.precio)}
                  <span className="ml-2 text-xs font-normal text-white/50">precio fijo</span>
                </p>
              )}
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
                {pack.idproducto && (
                  <PackShareActions
                    pack={{
                      nombre: pack.nombre,
                      precio: pack.precio,
                      siempre_incluye: pack.siempre_incluye,
                      idproducto: pack.idproducto,
                      ocasion: pack.ocasion,
                    }}
                    isFavorite={fav}
                    onToggleFavorite={() =>
                      pack.idproducto &&
                      toggleFavorite({
                        idproducto: pack.idproducto,
                        nombre: pack.nombre,
                        precio: pack.precio,
                        imagen_url: pack.imagen_url,
                        ocasion: pack.ocasion,
                      })
                    }
                    variant="dark"
                  />
                )}
                {pack.idproducto ? (
                  <Link
                    href={href}
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-amber-300 to-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:from-amber-200 hover:to-amber-400"
                  >
                    {pack.a_pedido ? 'Reservar combo' : 'Reservar este pack'}
                  </Link>
                ) : (
                  <span className="text-sm text-white/50">Próximamente</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-[1.35rem] bg-slate-950 bg-gradient-to-br ${gradientClass} shadow-premium ring-1 ${accentRing(pack.accent)} transition duration-300 hover:-translate-y-1 hover:shadow-premium-lg`}
    >
      <div className="relative shrink-0">
        <PackImagePanel pack={pack} items={items} compact />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          {pack.mas_pedido && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950">
              Recomendado
            </span>
          )}
          {pack.badge_fecha && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950">
              {pack.badge_fecha}
            </span>
          )}
          {pack.badge && (
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${accentBadge(pack.accent)}`}>
              {pack.badge}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col bg-slate-950/95 p-4">
        <h3 className="font-display text-lg font-extrabold leading-tight text-white">{pack.nombre}</h3>
        {pack.tagline && <p className="mt-0.5 text-[11px] text-white/60">{pack.tagline}</p>}

        <div className="mt-3 flex-1">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-white/40">Incluye</p>
          <ul className="max-h-52 space-y-1.5 overflow-y-auto pr-0.5">
            {items.map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-[10px] text-white/85">
                <span className="mt-0.5 shrink-0 text-amber-300/90">
                  <ItemIcon icon={item.icon} />
                </span>
                <span className="leading-snug">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          {pack.precio != null && (
            <p className="font-display text-xl font-extrabold text-white">{toCLP(pack.precio)}</p>
          )}
          {pack.idproducto && (
            <PackShareActions
              pack={{
                nombre: pack.nombre,
                precio: pack.precio,
                siempre_incluye: pack.siempre_incluye,
                idproducto: pack.idproducto,
                ocasion: pack.ocasion,
              }}
              isFavorite={fav}
              onToggleFavorite={() =>
                toggleFavorite({
                  idproducto: pack.idproducto!,
                  nombre: pack.nombre,
                  precio: pack.precio,
                  imagen_url: pack.imagen_url,
                  ocasion: pack.ocasion,
                })
              }
              variant="dark"
              compact
            />
          )}
          {pack.idproducto ? (
            <Link
              href={href}
              className="mt-2 block w-full rounded-xl bg-white/95 py-2.5 text-center text-xs font-bold text-slate-900 transition hover:bg-white"
            >
              {pack.a_pedido ? 'Reservar combo' : 'Ver pack completo'}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
