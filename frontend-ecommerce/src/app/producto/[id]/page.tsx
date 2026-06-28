import type { Metadata } from 'next';
import ProductoPageClient from './ProductoPageClient';

const API_BASE =
  process.env.API_URL_SERVER ||
  (process.env.API_UPSTREAM ? `${process.env.API_UPSTREAM}/api` : 'http://127.0.0.1:8002/api');

const SITE = 'https://www.dondemorales.cl';

async function fetchProduct(id: string) {
  try {
    const res = await fetch(`${API_BASE}/productos/${id}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function absoluteImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SITE}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await fetchProduct(params.id);

  if (!product?.nombre) {
    return {
      title: 'Producto no encontrado | DondeMorales',
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.nombre} | DondeMorales`;
  const rawDesc = typeof product.descripcion === 'string' ? product.descripcion.trim() : '';
  const price = product.precio_venta ?? product.precio;
  const description =
    rawDesc !== ''
      ? rawDesc.slice(0, 155)
      : `Compra ${product.nombre}${price ? ` desde $${Number(price).toLocaleString('es-CL')}` : ''} en DondeMorales, Renaico. Retiro o delivery.`;

  const image = absoluteImageUrl(product.imagen_url);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_CL',
      siteName: 'DondeMorales',
      url: `${SITE}/producto/${params.id}`,
      ...(image ? { images: [{ url: image, alt: product.nombre }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default function ProductoPage() {
  return <ProductoPageClient />;
}
