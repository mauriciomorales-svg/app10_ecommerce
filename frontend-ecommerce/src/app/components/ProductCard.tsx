'use client';

import Link from 'next/link';
import Image from 'next/image';
import AddToCartButton from './AddToCartButton';
import ProductImagePlaceholder, {
  inferPlaceholderVariant,
  type PlaceholderVariant,
} from './ProductImagePlaceholder';

export interface ProductCardItem {
  idproducto: number;
  nombre: string;
  precio_venta: number;
  stock: number;
  stock_disponible: number;
  es_pack?: boolean;
  has_bundle_options?: boolean;
  has_customization?: boolean;
  imagen_url?: string;
  categorias?: { idcategoria?: number; nombre: string }[];
  ahorro_pack_clp?: number;
  /** false = visible en catálogo pero sin compra online */
  venta_web?: boolean;
}

interface ProductCardProps {
  producto: ProductCardItem;
  onOpenBuilder?: () => void;
  placeholderVariant?: PlaceholderVariant;
}

function formatPrice(price: number) {
  if (!price) return '$0';
  return '$' + Math.round(price).toLocaleString('es-CL');
}

export default function ProductCard({
  producto,
  onOpenBuilder,
  placeholderVariant,
}: ProductCardProps) {
  const stock = producto.stock_disponible ?? producto.stock;
  const isPack =
    producto.es_pack || producto.has_bundle_options || producto.has_customization;
  const compraWeb = producto.venta_web !== false;
  const outOfStock = stock <= 0;
  const soloLocal = !compraWeb;
  const variant =
    placeholderVariant ?? inferPlaceholderVariant(producto);

  return (
    <article
      className={`product-card group flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
        outOfStock || soloLocal
          ? 'border-slate-100 opacity-75'
          : 'border-slate-100/80 shadow-card hover:border-brand-primary/25 hover:shadow-card-hover'
      }`}
    >
      <Link href={`/producto/${producto.idproducto}`} className="product-thumb block">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain object-center p-3 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <ProductImagePlaceholder variant={variant} nombre={producto.nombre} />
        )}

        {isPack && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-gradient-to-r from-brand-accent to-amber-400 px-2.5 py-0.5 text-[10px] font-bold text-brand-ink shadow-md">
            {producto.has_customization && !producto.es_pack && !producto.has_bundle_options
              ? 'PERSONALIZA'
              : 'PACK'}
          </span>
        )}
        {producto.ahorro_pack_clp && producto.ahorro_pack_clp > 0 && (
          <span className="absolute bottom-2 left-2 right-12 z-10 rounded-lg bg-brand-primary/95 px-2 py-0.5 text-center text-[10px] font-bold text-white shadow-md backdrop-blur-sm">
            Ahorra ${formatPrice(producto.ahorro_pack_clp)}
          </span>
        )}

        {stock > 0 && stock <= 5 && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
            Últimas
          </span>
        )}

        <div className="absolute bottom-2 right-2 z-10">
          <AddToCartButton producto={producto} onOpenBuilder={onOpenBuilder} compact />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="mb-1.5 font-display text-base font-extrabold tabular-nums leading-none text-brand-primary sm:text-lg">
          {formatPrice(producto.precio_venta)}
        </p>
        <Link
          href={`/producto/${producto.idproducto}`}
          className="line-clamp-2 flex-1 text-xs font-medium leading-snug text-brand-ink transition-colors hover:text-brand-primary sm:text-sm"
        >
          {producto.nombre}
        </Link>
        {outOfStock && (
          <p className="mt-2 text-[10px] font-semibold text-red-600">Agotado</p>
        )}
        {soloLocal && !outOfStock && (
          <p className="mt-2 text-[10px] font-semibold text-slate-500">Solo en local</p>
        )}
      </div>
    </article>
  );
}
