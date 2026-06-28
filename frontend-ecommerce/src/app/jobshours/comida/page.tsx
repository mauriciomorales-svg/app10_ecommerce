import type { Metadata } from 'next';
import JhComidaLanding from '../JhComidaLanding';
import { formatCLP } from '../../lib/money';
import { PRECIOS } from '../jh-data';

export const metadata: Metadata = {
  title: 'JobsHours Comida · Tu cliente pide y paga solo',
  description: `Tablet de pedidos + Mercado Pago. Pack Express ${formatCLP(PRECIOS.packExpress)} o desde ${formatCLP(PRECIOS.planMinimo)}/mes.`,
  alternates: { canonical: '/comida' },
};

export default function JobshoursComidaPage() {
  return <JhComidaLanding />;
}
