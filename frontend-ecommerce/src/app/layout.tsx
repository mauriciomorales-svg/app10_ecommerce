import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { CommerceStoreProvider } from './context/CommerceStoreContext';
import MetaPixel from './components/MetaPixel';
import DmAnalyticsBootstrap from './components/DmAnalyticsBootstrap';
import WhatsAppFloat from './components/WhatsAppFloat';

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Toppi\'s · DondeMorales — Renaico',
  description:
    'Elige tu base, ponle tu Toppi\'s. Helado, comida y regalo con productos reales — retiro Santiago Watt 205, Renaico.',
  openGraph: {
    title: 'Toppi\'s · DondeMorales — Renaico',
    description:
      'Helado Toppi\'s · Comida Toppi\'s · Regalo Toppi\'s. Reserva online · retiro Santiago Watt 205, Renaico.',
    locale: 'es_CL',
    type: 'website',
    siteName: 'DondeMorales',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        <MetaPixel />
        <DmAnalyticsBootstrap />
        <CommerceStoreProvider>
          <ToastProvider>
            <CartProvider>
              {children}
              <WhatsAppFloat />
            </CartProvider>
          </ToastProvider>
        </CommerceStoreProvider>
      </body>
    </html>
  );
}
