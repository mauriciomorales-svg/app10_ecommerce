'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Package,
  Loader2,
  ChevronRight,
  Zap,
  AlertCircle,
} from 'lucide-react';
import StorePageHeader from '../../components/StorePageHeader';
import ProductBuilderModal from '../../components/ProductBuilderModal';
import ProductCard, { ProductCardItem } from '../../components/ProductCard';
import AddToCartButton from '../../components/AddToCartButton';
import { useCartFeedback } from '../../hooks/useCartFeedback';
import { resolveCartStock } from '../../lib/cartHelpers';
import { formatCLP, toCLP } from '../../lib/money';
import { PICKUP_LINE } from '../../lib/brandCopy';
import { linesFromComponentes } from '../../lib/packIncludes';
import TarjetaSaludoPreview from '../../components/TarjetaSaludoPreview';

interface ProductDetail {
  idproducto: number;
  nombre: string;
  descripcion?: string | null;
  precio_venta: number;
  precio?: number;
  stock_actual?: number;
  stock_disponible?: number;
  stock?: number;
  imagen_url?: string | null;
  es_pack?: boolean;
  bundle_groups?: unknown[];
  customization_fields?: unknown[];
  categorias?: { idcategoria?: number; nombre: string }[];
  mensaje_stock?: string | null;
  venta_web?: boolean;
  componentes?: { idproducto: number; nombre: string; cantidad_incluida?: number }[];
}

export default function ProductoPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Number(params.id);
  const { addWithFeedback } = useCartFeedback();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [suggestions, setSuggestions] = useState<ProductCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [suggestionBuilderId, setSuggestionBuilderId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const [productRes, sugRes] = await Promise.all([
        fetch(`/api/productos/${id}`),
        fetch(`/api/productos/${id}/sugerencias`),
      ]);
      if (!productRes.ok) throw new Error('not found');
      const data = await productRes.json();
      setProduct({
        ...data,
        precio_venta: toCLP(data.precio_venta ?? data.precio ?? 0),
        stock_disponible: data.stock_disponible ?? data.stock_actual ?? data.stock ?? 0,
      });

      if (sugRes.ok) {
        const sugData = await sugRes.json();
        const list = Array.isArray(sugData) ? sugData : [];
        setSuggestions(
          list.map((p: Record<string, unknown>) => ({
            idproducto: p.idproducto as number,
            nombre: p.nombre as string,
            precio_venta: toCLP((p.precio_venta ?? p.precio ?? 0) as number),
            stock: (p.stock ?? p.stock_actual ?? 0) as number,
            stock_disponible: (p.stock_disponible ?? p.stock_actual ?? 0) as number,
            es_pack: Boolean(p.es_pack),
            has_bundle_options: Boolean(p.has_bundle_options),
            has_customization: Boolean(p.has_customization),
            imagen_url: p.imagen_url as string | undefined,
            categorias: p.categorias as ProductCardItem['categorias'],
            venta_web: p.venta_web !== false,
          })),
        );
      }
    } catch {
      setError(true);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const stock = product?.stock_disponible ?? 0;
  const compraWeb = product?.venta_web !== false;
  const hasBundle =
    Boolean(product?.es_pack) ||
    (Array.isArray(product?.bundle_groups) && product.bundle_groups.length > 0) ||
    (Array.isArray(product?.customization_fields) && product.customization_fields.length > 0);

  useEffect(() => {
    if (loading || !product || searchParams.get('armar') !== '1') {
      return;
    }
    if (hasBundle) {
      setBuilderOpen(true);
    }
  }, [loading, product, searchParams, hasBundle]);
  const hasCustomization =
    Array.isArray(product?.customization_fields) && product.customization_fields.length > 0;
  const categoria = product?.categorias?.[0];
  const packContentLines = linesFromComponentes(product?.componentes);
  const cardProduct = product
    ? {
        idproducto: product.idproducto,
        nombre: product.nombre,
        precio_venta: product.precio_venta,
        stock,
        stock_disponible: stock,
        es_pack: product.es_pack,
        has_bundle_options: hasBundle,
        has_customization: hasCustomization,
        imagen_url: product.imagen_url ?? undefined,
        categorias: product.categorias,
        venta_web: product.venta_web,
      }
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-surface">
        <StorePageHeader backHref="/#catalogo" backLabel="Catálogo" />
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-10 w-10 text-brand-primary animate-spin mb-3" />
          <p className="text-brand-muted text-sm">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-brand-surface">
        <StorePageHeader backHref="/#catalogo" backLabel="Catálogo" />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-brand-ink mb-2">Producto no encontrado</h2>
          <Link href="/#catalogo" className="btn-primary inline-block mt-4">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface pb-28 md:pb-10">
      <StorePageHeader backHref="/#catalogo" backLabel="Catálogo" title={product.nombre} />

      <div className="max-w-6xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-1 text-xs text-brand-muted mb-4 flex-wrap">
          <Link href="/" className="hover:text-brand-primary font-medium">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/#catalogo" className="hover:text-brand-primary font-medium">
            Catálogo
          </Link>
          {categoria && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <Link
                href={`/?categoria=${categoria.idcategoria}#catalogo`}
                className="hover:text-brand-primary font-medium truncate max-w-[140px]"
              >
                {categoria.nombre}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-brand-ink font-semibold truncate max-w-[180px]">{product.nombre}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="relative aspect-square bg-[#F8FAFC]">
              {product.imagen_url ? (
                <img
                  src={product.imagen_url}
                  alt={product.nombre}
                  className="absolute inset-0 w-full h-full object-contain p-6"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package className="h-20 w-20 text-slate-200" />
                </div>
              )}
              {product.es_pack && (
                <span className="absolute top-4 left-4 bg-brand-accent text-brand-ink text-xs font-bold px-3 py-1 rounded-full">
                  PACK
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-brand-ink leading-tight mb-2">
              {product.nombre}
            </h1>

            {categoria && (
              <p className="text-sm text-brand-muted mb-3">{categoria.nombre}</p>
            )}

            <p className="font-display font-extrabold text-3xl sm:text-4xl text-brand-primary tabular-nums mb-4">
              ${formatCLP(product.precio_venta)}
            </p>

            {stock > 0 && stock <= 5 && (
              <p className="text-sm font-semibold text-red-600 mb-3">
                ¡Solo quedan {stock} en stock!
              </p>
            )}
            {product.mensaje_stock && (
              <p className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
                {product.mensaje_stock}
              </p>
            )}
            {stock <= 0 && (
              <p className="text-sm font-bold text-red-600 mb-3">Producto agotado</p>
            )}
            {!compraWeb && stock > 0 && (
              <p className="text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-3">
                Disponible solo en local · {PICKUP_LINE}. Compra online: helado, comida, regalo y packs Toppi&apos;s.
              </p>
            )}

            {packContentLines.length > 0 && (
              <div className="bg-emerald-50/80 rounded-2xl border border-emerald-100 p-4 mb-4 shadow-card">
                <h2 className="font-display font-semibold text-sm text-brand-primary mb-2">
                  Contenido del pack
                </h2>
                <ul className="space-y-1 text-sm text-brand-ink/90">
                  {packContentLines.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="font-bold text-brand-primary">·</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-brand-muted">
                  Pack cerrado — lo que ves es lo que recibes.
                </p>
              </div>
            )}

            {hasCustomization && (product.es_pack || /regalo|pack/i.test(product.nombre)) && (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold text-rose-800">
                  Puedes incluir nombre del destinatario y mensaje en tarjeta al personalizar
                </p>
                <TarjetaSaludoPreview
                  compact
                  nombreDestinatario="Ejemplo — Mamá"
                  mensaje="Feliz cumpleaños, te queremos mucho"
                />
              </div>
            )}

            {product.descripcion && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4 shadow-card">
                <h2 className="font-display font-semibold text-sm text-brand-ink mb-2">Descripción</h2>
                <p className="text-sm text-brand-muted leading-relaxed whitespace-pre-wrap">
                  {product.descripcion}
                </p>
              </div>
            )}

            <div className="hidden md:block mt-auto space-y-3">
              {hasBundle ? (
                <button
                  type="button"
                  onClick={() => setBuilderOpen(true)}
                  disabled={stock <= 0 || !compraWeb}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-brand-accent hover:bg-brand-accent-hover text-brand-ink font-display font-bold rounded-2xl disabled:opacity-50 transition-colors"
                >
                  <Zap className="h-5 w-5" />
                  {compraWeb ? 'Personalizar y agregar' : 'Solo en local'}
                </button>
              ) : (
                cardProduct && (
                  <div className="w-full [&_button]:w-full [&_button]:py-4 [&_button]:rounded-2xl [&_button]:text-base">
                    <AddToCartButton producto={cardProduct} />
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {suggestions.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display font-bold text-lg text-brand-ink mb-4">
              También te puede interesar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {suggestions.map((p) => (
                <ProductCard
                  key={p.idproducto}
                  producto={p}
                  onOpenBuilder={
                    p.has_bundle_options || p.has_customization
                      ? () => setSuggestionBuilderId(p.idproducto)
                      : undefined
                  }
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-brand-surface via-brand-surface to-transparent">
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-brand-muted truncate">{product.nombre}</p>
            <p className="font-display font-extrabold text-brand-primary tabular-nums">
              ${formatCLP(product.precio_venta)}
            </p>
          </div>
          {hasBundle ? (
            <button
              type="button"
              onClick={() => setBuilderOpen(true)}
              disabled={stock <= 0 || !compraWeb}
              className="shrink-0 flex items-center gap-2 px-4 py-3 bg-brand-accent text-brand-ink font-bold rounded-xl disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              {compraWeb ? 'Personalizar' : 'Solo en local'}
            </button>
          ) : (
            cardProduct && (
              <div className="shrink-0 [&_button]:px-4 [&_button]:py-3 [&_button]:rounded-xl">
                <AddToCartButton producto={cardProduct} compact />
              </div>
            )
          )}
        </div>
      </div>

      {builderOpen && product && (
        <ProductBuilderModal
          productId={product.idproducto}
          onClose={() => setBuilderOpen(false)}
          onAddToCart={(item) => {
            addWithFeedback({
              idproducto: item.idproducto,
              nombre: item.nombre,
              precio_venta: item.precio_venta,
              imagen: item.imagen || null,
              stock: resolveCartStock(stock, item.bundle_configuration),
              pack_includes: item.pack_includes,
              bundle_configuration: item.bundle_configuration,
              idcategoria: item.idcategoria ?? null,
            });
            setBuilderOpen(false);
          }}
        />
      )}

      {suggestionBuilderId && (
        <ProductBuilderModal
          productId={suggestionBuilderId}
          onClose={() => setSuggestionBuilderId(null)}
          onAddToCart={(item) => {
            const sug = suggestions.find((s) => s.idproducto === suggestionBuilderId);
            addWithFeedback({
              idproducto: item.idproducto,
              nombre: item.nombre,
              precio_venta: item.precio_venta,
              imagen: item.imagen || null,
              stock: resolveCartStock(sug?.stock_disponible ?? sug?.stock ?? 0, item.bundle_configuration),
              pack_includes: item.pack_includes,
              bundle_configuration: item.bundle_configuration,
              idcategoria: item.idcategoria ?? null,
            });
            setSuggestionBuilderId(null);
          }}
        />
      )}
    </div>
  );
}
