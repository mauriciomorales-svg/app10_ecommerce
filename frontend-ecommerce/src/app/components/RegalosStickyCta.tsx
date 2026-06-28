'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gift, Scale } from 'lucide-react';

export default function RegalosStickyCta() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const check = () => {
      setHidden(document.body.hasAttribute('data-builder-open'));
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-builder-open'] });
    return () => observer.disconnect();
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-rose-200/80 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:hidden">
      <div className="mx-auto flex max-w-lg gap-1.5">
        <Link
          href="#regalo-quiz"
          className="flex flex-1 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 py-2.5 text-[11px] font-bold text-violet-900"
        >
          Quiz
        </Link>
        <Link
          href="#comparar-packs"
          className="flex flex-1 items-center justify-center gap-0.5 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-[11px] font-bold text-rose-900"
        >
          <Scale className="h-3.5 w-3.5" />
          Comparar
        </Link>
        <Link
          href="#packs-premium"
          className="flex flex-[1.2] items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-rose-600 to-fuchsia-600 py-2.5 text-[11px] font-bold text-white shadow-md"
        >
          <Gift className="h-3.5 w-3.5" />
          Packs
        </Link>
      </div>
    </div>
  );
}
