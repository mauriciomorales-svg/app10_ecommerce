import type { Metadata } from 'next';
import JobshoursCatalogPage from '../JobshoursCatalogPage';

export const metadata: Metadata = {
  title: 'JobsHours · Catálogo y precios',
  description: 'Todos los planes: comida, minimarket y local mixto. Comparativas y pagos.',
  robots: { index: false, follow: true },
};

export default function JobshoursCatalogoPage() {
  return <JobshoursCatalogPage />;
}
