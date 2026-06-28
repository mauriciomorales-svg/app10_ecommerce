'use client';

import { Heart, MessageCircle } from 'lucide-react';
import { packWhatsAppHref, type PackSharePayload } from '../lib/packShareWhatsApp';

type Props = {
  pack: PackSharePayload;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  variant?: 'dark' | 'light';
  compact?: boolean;
};

export default function PackShareActions({
  pack,
  isFavorite = false,
  onToggleFavorite,
  variant = 'dark',
  compact = false,
}: Props) {
  const isDark = variant === 'dark';
  const waHref = packWhatsAppHref(pack);
  const canFavorite = Boolean(pack.idproducto && onToggleFavorite);

  const btnBase = compact
    ? 'inline-flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-bold transition'
    : 'inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-[10px] font-bold transition';

  const waClass = isDark
    ? `${btnBase} bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/30 hover:bg-emerald-500/30`
    : `${btnBase} bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100`;

  const favClass = isFavorite
    ? isDark
      ? `${btnBase} bg-rose-500/30 text-rose-100 ring-1 ring-rose-400/40`
      : `${btnBase} bg-rose-100 text-rose-800 ring-1 ring-rose-300`
    : isDark
      ? `${btnBase} bg-white/10 text-white/80 ring-1 ring-white/15 hover:bg-white/15`
      : `${btnBase} bg-white text-brand-muted ring-1 ring-rose-100 hover:bg-rose-50`;

  return (
    <div className={`flex gap-1.5 ${compact ? 'mt-2' : 'mt-3'}`}>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className={waClass}
        onClick={(e) => e.stopPropagation()}
      >
        <MessageCircle className="h-3.5 w-3.5 shrink-0" />
        WhatsApp
      </a>
      {canFavorite && (
        <button
          type="button"
          className={favClass}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
        >
          <Heart className={`h-3.5 w-3.5 shrink-0 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? 'Guardado' : 'Guardar'}
        </button>
      )}
    </div>
  );
}
