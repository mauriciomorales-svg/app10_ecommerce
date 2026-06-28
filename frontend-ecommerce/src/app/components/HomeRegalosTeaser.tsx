'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function HomeRegalosTeaser() {
  return (
    <section className="mx-auto mb-4 max-w-7xl px-3 sm:px-4">
      <Link
        href="/regalos#regalo-quiz"
        className="group flex items-center justify-between gap-3 overflow-hidden rounded-[1.25rem] border border-violet-200/70 bg-gradient-to-r from-violet-50 via-white to-rose-50/80 px-4 py-3 shadow-premium transition hover:border-violet-300 hover:shadow-premium-lg sm:px-5 sm:py-4"
      >
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-800">
            <Sparkles className="h-3 w-3" />
            Regalo Toppi&apos;s
          </span>
          <p className="mt-1 font-display text-base font-extrabold text-brand-ink sm:text-lg">
            ¿No sabes qué regalar? 3 preguntas y te orientamos
          </p>
          <p className="text-xs text-brand-muted sm:text-sm">
            Quiz · packs listos · retiro Santiago Watt 205, Renaico
          </p>
        </div>
        <span className="shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-rose-600 px-3 py-2 text-xs font-bold text-white shadow-md transition group-hover:scale-[1.02] sm:px-4 sm:py-2.5">
          Empezar
        </span>
      </Link>
    </section>
  );
}
