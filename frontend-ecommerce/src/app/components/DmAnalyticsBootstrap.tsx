'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  analyticsSiteId,
  captureMarketingAttributionFromUrl,
} from '../lib/marketingAttribution';
import { trackPageView } from '../lib/commerceEvents';

let lastTracked = '';

/** Captura UTM y registra page_view (DondeMorales + JobsHours, excepto admin). */
export default function DmAnalyticsBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    captureMarketingAttributionFromUrl();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin')) return;

    const key = `${pathname}${window.location.search}`;
    if (lastTracked === key) return;
    lastTracked = key;

    trackPageView({ site: analyticsSiteId() });
  }, [pathname]);

  return null;
}
