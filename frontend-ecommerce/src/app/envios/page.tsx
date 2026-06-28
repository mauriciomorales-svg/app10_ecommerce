import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import CartButton from '../components/CartButton';
import EnviosFaqContent from '../components/EnviosFaqContent';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Envíos y retiro · DondeMorales Renaico',
  description:
    'Retiro gratis Santiago Watt 205, envío Renaico desde $2.000, ventanas almuerzo y cena. Preguntas frecuentes packs y regalos.',
};

export default function EnviosPage() {
  return (
    <div className="home-page-bg min-h-screen pb-24">
      <header className="premium-glass-header">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-muted hover:text-brand-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Inicio
          </Link>
          <div className="mx-auto">
            <Logo compact />
          </div>
          <Suspense>
            <CartButton />
          </Suspense>
        </div>
      </header>

      <EnviosFaqContent />
    </div>
  );
}
