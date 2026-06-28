'use client';

import Image from 'next/image';
import { FLYERS, SOCIAL_PROOF, TESTIMONIAL } from './jh-data';

export function JhSocialProofStrip() {
  return (
    <section className="border-y border-slate-100 bg-white px-4 py-6">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-bold text-[var(--jh-ink)]">{SOCIAL_PROOF.headline}</p>
        <p className="mt-1 text-xs text-[var(--jh-muted)]">{SOCIAL_PROOF.subline}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {SOCIAL_PROOF.locales.map((name) => (
            <span
              key={name}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-[var(--jh-muted)]"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function JhTestimonialBlock({ showImage = true }: { showImage?: boolean }) {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
        {showImage && (
          <Image
            src={FLYERS.pagos}
            alt="Cobro con Mercado Pago en local con JobsHours"
            width={700}
            height={500}
            className="rounded-2xl shadow-md"
          />
        )}
        <div>
          <span className="jh-badge jh-badge-blue">{TESTIMONIAL.badge}</span>
          <h2 className="mt-3 font-display text-2xl font-bold text-[var(--jh-ink)]">{TESTIMONIAL.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--jh-muted)]">{TESTIMONIAL.body}</p>
          <blockquote className="mt-4 border-l-4 border-[var(--jh-green)] pl-4 text-sm italic text-[var(--jh-ink)]">
            {TESTIMONIAL.quote}
          </blockquote>
          <p className="mt-3 text-xs font-semibold text-[var(--jh-muted)]">{TESTIMONIAL.attribution}</p>
        </div>
      </div>
    </section>
  );
}
