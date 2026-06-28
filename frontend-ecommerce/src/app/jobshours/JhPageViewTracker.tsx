'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '../lib/commerceEvents';

/** Evita contar dos veces la misma ruta en un render estricto. */
let lastTracked = '';

export default function JhPageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/jobshours/visitas')) return;

    const key = `${pathname}${window.location.search}`;
    if (lastTracked === key) return;
    lastTracked = key;

    trackPageView();
  }, [pathname]);

  return null;
}
