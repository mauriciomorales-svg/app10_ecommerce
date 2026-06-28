import type { Metadata } from 'next';
import JhMinimarketLanding from '../JhMinimarketLanding';
import { formatCLP } from '../../lib/money';
import { PRECIOS } from '../jh-data';

export const metadata: Metadata = {
  title: 'JobsHours Minimarket · Caja e inventario',
  description: `Caja con lector de barras e inventario desde ${formatCLP(PRECIOS.planRetail)}/mes. Almacén, ferretería, minimarket.`,
  alternates: { canonical: '/minimarket' },
};

export default function JobshoursMinimarketPage() {
  return <JhMinimarketLanding />;
}
