import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cocina de la casa · DondeMorales — Renaico',
  description:
    'Platos listos o kits para cocinar en casa. Basado en lo más pedido en Facebook de Angol, Renaico y Nacimiento. Retiro Santiago Watt 205.',
};

export default function CocinaCasaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
