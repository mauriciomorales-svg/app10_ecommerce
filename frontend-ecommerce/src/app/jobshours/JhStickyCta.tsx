'use client';

import { MessageCircle, ShoppingCart } from 'lucide-react';

type LinkCta = {
  kind: 'link';
  href: string;
  label: string;
  icon?: 'whatsapp' | 'cart';
};

type ButtonCta = {
  kind: 'button';
  onClick: () => void;
  label: string;
  icon?: 'whatsapp' | 'cart';
};

export function JhStickyCta({
  primary,
  sub,
  secondary,
}: {
  primary: LinkCta | ButtonCta;
  sub?: string;
  secondary?: { href: string; label: string };
}) {
  const Icon = primary.icon === 'cart' ? ShoppingCart : MessageCircle;
  const primaryClass = primary.icon === 'cart' ? 'jh-btn-primary' : 'jh-btn-primary';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      {primary.kind === 'link' ? (
        <a
          href={primary.href}
          target={primary.href.startsWith('http') ? '_blank' : undefined}
          rel={primary.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={`${primaryClass} flex w-full justify-center gap-2`}
        >
          <Icon className="h-5 w-5" />
          {primary.label}
        </a>
      ) : (
        <button type="button" onClick={primary.onClick} className={`${primaryClass} flex w-full justify-center gap-2`}>
          <Icon className="h-5 w-5" />
          {primary.label}
        </button>
      )}
      {sub && <p className="mt-1 text-center text-[10px] font-semibold text-[var(--jh-muted)]">{sub}</p>}
      {secondary && (
        <a
          href={secondary.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-center text-xs font-bold text-[var(--jh-green-dark)] hover:underline"
        >
          {secondary.label}
        </a>
      )}
    </div>
  );
}
