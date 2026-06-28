'use client';

import Link from 'next/link';
import { Sparkles, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';

type WeeklyOffer = {
  enabled: boolean;
  title: string;
  subtitle: string;
  href: string;
  coupon: string;
  badge: string;
};

export default function HomeWeeklyOfferBanner() {
  const [offer, setOffer] = useState<WeeklyOffer | null>(null);

  useEffect(() => {
    fetch('/api/commerce/marketing')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.weekly_offer?.enabled) {
          setOffer(data.weekly_offer as WeeklyOffer);
        }
      })
      .catch(() => {});
  }, []);

  if (!offer?.title) return null;

  const href = offer.coupon
    ? `${offer.href}${offer.href.includes('?') ? '&' : '?'}coupon=${encodeURIComponent(offer.coupon)}&utm_source=facebook&utm_medium=web&utm_campaign=oferta_semana`
    : `${offer.href}${offer.href.includes('?') ? '&' : '?'}utm_source=facebook&utm_medium=web&utm_campaign=oferta_semana`;

  return (
    <section className="mx-auto max-w-7xl px-3 pt-2 sm:px-4">
      <Link
        href={href}
        className="group flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-4 shadow-sm transition hover:border-amber-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
            <Sparkles className="h-3.5 w-3.5" />
            {offer.badge || 'Oferta de la semana'}
          </p>
          <h2 className="font-display text-lg font-extrabold text-brand-ink sm:text-xl">{offer.title}</h2>
          {offer.subtitle && (
            <p className="mt-1 text-sm text-brand-muted">{offer.subtitle}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {offer.coupon && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 ring-1 ring-amber-200">
              <Tag className="h-3.5 w-3.5" />
              {offer.coupon}
            </span>
          )}
          <span className="rounded-xl bg-brand-primary px-4 py-2 text-sm font-bold text-white group-hover:bg-brand-primary-hover">
            Ver oferta
          </span>
        </div>
      </Link>
    </section>
  );
}
