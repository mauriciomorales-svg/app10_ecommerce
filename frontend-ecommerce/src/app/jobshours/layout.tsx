import type { Metadata } from 'next';
import './jh-theme.css';
import JhPageViewTracker from './JhPageViewTracker';

const JH_STORE_URL = new URL('https://tienda.jobshours.com/');
export const metadata: Metadata = {
  metadataBase: JH_STORE_URL,
  title: 'JobsHours · Tu cliente pide y paga solo. Tú te quedas en la cocina.',
  description:
    'Tablet de pedidos + Mercado Pago: el cliente elige y paga, tú preparas en cocina. Desde $29.990/mes o instalación + primer mes $109.990.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    url: JH_STORE_URL,
    title: 'JobsHours · Tiendas Inteligentes',
    description: 'Elige comida o minimarket · Pack Express $199.990 · Desde $29.990/mes',
    images: [{ url: '/jobshours/flyers/kiosko-mostrador.png', alt: 'JobsHours tablet de pedidos en mostrador' }],
    locale: 'es_CL',
    type: 'website',
    siteName: 'JobsHours',
  },
};

export default function JobshoursLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="jh-store min-h-screen">
      <JhPageViewTracker />
      {children}
    </div>
  );
}