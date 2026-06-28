'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

const WA = '56975647756';
const DEFAULT_MSG = 'Hola, tengo una consulta sobre dondemorales.cl';

export default function WhatsAppFloat() {
  const path = usePathname() ?? '';
  if (path.startsWith('/jobshours') || path.startsWith('/legal') || path.startsWith('/bio')) {
    return null;
  }

  const href = `https://wa.me/${WA}?text=${encodeURIComponent(DEFAULT_MSG)}`;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition hover:scale-105 hover:bg-[#20bd5a] md:bottom-6 md:right-6 md:h-14 md:w-14"
    >
      <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
    </Link>
  );
}
