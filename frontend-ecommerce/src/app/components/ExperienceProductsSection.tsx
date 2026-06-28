'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2 } from 'lucide-react';
import ProductCard, { ProductCardItem } from './ProductCard';
import ProductBuilderModal from './ProductBuilderModal';
import { useCart } from '../context/CartContext';
import { toCLP } from '../lib/money';

type BlockData = {
  title: string;
  tagline: string;
  description: string;
  categoria: { idcategoria: number; nombre: string } | null;
  categorias: { idcategoria: number; nombre: string }[];
  productos: Record<string, unknown>[];
};

type Theme = 'toppis' | 'regalos' | 'salada' | 'platos_listos';
type BlockKey = Theme;

const THEME_STYLES: Record<
  Theme,
  {
    section: string;
    cta: string;
    chipHover: string;
    badge: string;
    glow: string;
    placeholder: 'toppis' | 'regalos' | 'salada';
  }
> = {
  toppis: {
    section:
      'border-toppis-mustard/25 bg-gradient-to-br from-white via-amber-50/40 to-neutral-100 shadow-lg shadow-black/5',
    cta: 'bg-gradient-to-r from-toppis-mustard to-amber-600 text-toppis-ink shadow-lg shadow-toppis-mustard/30 hover:shadow-xl',
    chipHover: 'hover:border-toppis-mustard hover:bg-amber-50/60',
    badge: 'bg-toppis-ink text-toppis-mustard shadow-sm',
    glow: 'bg-toppis-mustard/20',
    placeholder: 'toppis',
  },
  regalos: {
    section:
      'border-rose-200/50 bg-gradient-to-br from-white via-rose-50/40 to-violet-50/30 shadow-lg shadow-rose-900/5',
    cta: 'bg-gradient-to-r from-rose-600 to-violet-700 text-white shadow-lg shadow-rose-600/25 hover:shadow-xl',
    chipHover: 'hover:border-rose-400 hover:bg-rose-50/50',
    badge: 'bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white shadow-sm',
    glow: 'bg-rose-400/20',
    placeholder: 'regalos',
  },
  salada: {
    section:
      'border-amber-200/50 bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 shadow-lg shadow-amber-900/5',
    cta: 'bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-lg shadow-amber-600/25 hover:shadow-xl',
    chipHover: 'hover:border-amber-400 hover:bg-amber-50/50',
    badge: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm',
    glow: 'bg-amber-400/25',
    placeholder: 'salada',
  },
  platos_listos: {
    section:
      'border-red-200/50 bg-gradient-to-br from-white via-red-50/30 to-amber-50/40 shadow-lg shadow-red-900/5',
    cta: 'bg-gradient-to-r from-red-600 to-amber-700 text-white shadow-lg shadow-red-600/25 hover:shadow-xl',
    chipHover: 'hover:border-red-400 hover:bg-red-50/50',
    badge: 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm',
    glow: 'bg-red-400/20',
    placeholder: 'salada',
  },
};

type Props = {
  blockKey: BlockKey;
  sectionId: string;
  theme: Theme;
  badgeLabel: string;
  orderLabel?: string;
};

export default function ExperienceProductsSection({
  blockKey,
  sectionId,
  theme,
  badgeLabel,
  orderLabel,
}: Props) {
  const styles = THEME_STYLES[theme];
  const [block, setBlock] = useState<BlockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [builderProductId, setBuilderProductId] = useState<number | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch('/api/tienda/experiencias-home')
      .then((r) => r.json())
      .then((data) => setBlock(data[blockKey] ?? null))
      .catch(() => setBlock(null))
      .finally(() => setLoading(false));
  }, [blockKey]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!block || block.productos.length === 0) return null;

  const products: ProductCardItem[] = block.productos.map((p) => ({
    idproducto: p.idproducto as number,
    nombre: p.nombre as string,
    precio_venta: toCLP((p.precio_venta ?? 0) as number),
    stock: (p.stock_disponible ?? 0) as number,
    stock_disponible: (p.stock_disponible ?? 0) as number,
    es_pack: Boolean(p.es_pack),
    has_bundle_options:
      blockKey === 'platos_listos' ? false : Boolean(p.has_bundle_options),
    has_customization:
      blockKey === 'platos_listos' ? false : Boolean(p.has_customization),
    imagen_url: p.imagen_url as string | undefined,
    categorias: p.categorias as ProductCardItem['categorias'],
  }));

  const verTodoHref =
    blockKey === 'toppis'
      ? '/helados'
      : blockKey === 'salada'
        ? '/salada'
        : blockKey === 'regalos'
          ? '/regalos'
          : block.categoria
            ? `/?categoria=${block.categoria.idcategoria}#catalogo`
            : '#catalogo';

  const ctaLabel =
    blockKey === 'toppis'
      ? 'Ver todos los helados'
      : blockKey === 'salada'
        ? 'Ver comida Toppi\'s'
        : blockKey === 'regalos'
          ? 'Ver regalo Toppi\'s'
          : blockKey === 'platos_listos'
            ? 'Ver platos listos'
            : 'Ver todos los regalos';

  return (
    <section
      id={sectionId}
      className={`relative mx-auto mb-4 max-w-7xl scroll-mt-24 overflow-hidden rounded-[1.65rem] border px-3 py-6 shadow-premium sm:px-5 sm:py-8 ${styles.section}`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl ${styles.glow}`}
      />

      <div className="relative mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span
            className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ${styles.badge}`}
          >
            {orderLabel && (
              <span className="rounded-md bg-black/15 px-1.5 py-0.5 text-[9px]">{orderLabel}</span>
            )}
            {badgeLabel}
          </span>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-ink">{block.title}</h2>
          <p className="text-sm sm:text-base text-brand-muted mt-1 max-w-xl">{block.tagline}</p>
        </div>
        <Link
          href={verTodoHref}
          className={`inline-flex shrink-0 items-center gap-1 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${styles.cta}`}
        >
          {ctaLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {block.categorias.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {block.categorias.map((c) => (
            <Link
              key={c.idcategoria}
              href={`/?categoria=${c.idcategoria}#catalogo`}
              className={`text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white border border-slate-200 text-brand-ink ${styles.chipHover}`}
            >
              {c.nombre}
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x -mx-1 px-1">
        {products.map((p) => (
          <div key={p.idproducto} className="w-[160px] sm:w-[180px] shrink-0 snap-start">
            <ProductCard
              producto={p}
              placeholderVariant={styles.placeholder}
              onOpenBuilder={() => setBuilderProductId(p.idproducto)}
            />
          </div>
        ))}
      </div>

      <p className="text-xs sm:text-sm text-brand-muted mt-3 leading-relaxed">{block.description}</p>

      {builderProductId && (
        <ProductBuilderModal
          productId={builderProductId}
          onClose={() => setBuilderProductId(null)}
          onAddToCart={(item) => {
            addToCart({
              idproducto: item.idproducto,
              nombre: item.nombre,
              precio_venta: item.precio_venta,
              imagen: item.imagen || null,
              stock: 99,
              pack_includes: item.pack_includes,
              bundle_configuration: item.bundle_configuration,
              idcategoria: item.idcategoria ?? null,
            });
          }}
        />
      )}
    </section>
  );
}
