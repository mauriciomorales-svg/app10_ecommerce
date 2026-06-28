import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comida Toppi\'s · DondeMorales — Renaico',
  description:
    'Chorrillana, completo, wok y platos listos. Elige tu base y ponle tu Toppi\'s. Guía por porciones y retiro Santiago Watt 205.',
};

export default function SaladaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
