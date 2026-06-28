import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Visitas · JobsHours (interno)',
  robots: { index: false, follow: false },
};

export default function VisitasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
