import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regalo Toppi\'s · DondeMorales — Renaico',
  description:
    'Packs regalo listos o personalizables. Quiz de 3 preguntas, retiro Santiago Watt 205 Renaico. Desayuno, cumpleaños, amor, corporativo y más.',
  openGraph: {
    title: '¿Cuál es tu regalo Toppi\'s? · DondeMorales',
    description: 'Elige ocasión, personaliza mensaje y reserva online. Retiro en local Renaico.',
    images: [{ url: '/images/hero-regalos.png', width: 1200, height: 630, alt: 'Regalos DondeMorales' }],
  },
};

export default function RegalosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
