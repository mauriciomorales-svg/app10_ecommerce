'use client';

import { Heart } from 'lucide-react';

type Props = {
  nombreDestinatario?: string;
  mensaje?: string;
  compact?: boolean;
};

export default function TarjetaSaludoPreview({ nombreDestinatario, mensaje, compact }: Props) {
  const hasContent = Boolean(nombreDestinatario?.trim() || mensaje?.trim());
  if (!hasContent) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 via-white to-violet-50/40 ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600">
        <Heart className="h-3 w-3" />
        Vista previa tarjeta
      </p>
      <div
        className={`mx-auto max-w-xs rounded-xl border border-dashed border-rose-300/60 bg-white shadow-inner ${
          compact ? 'px-4 py-5' : 'px-6 py-8'
        }`}
      >
        <p className="text-center font-display text-xs font-bold uppercase tracking-widest text-rose-400">
          Toppi&apos;s · DondeMorales
        </p>
        {nombreDestinatario?.trim() && (
          <p className="mt-3 text-center font-display text-lg font-extrabold text-brand-ink">
            Para {nombreDestinatario.trim()}
          </p>
        )}
        {mensaje?.trim() ? (
          <p className="mt-2 text-center text-sm italic leading-relaxed text-brand-muted">
            &ldquo;{mensaje.trim()}&rdquo;
          </p>
        ) : (
          <p className="mt-2 text-center text-xs text-brand-muted/60">Tu mensaje aparecerá aquí</p>
        )}
        <div className="mt-4 flex justify-center">
          <span className="h-px w-12 bg-rose-200" />
        </div>
      </div>
      <p className="mt-2 text-center text-[10px] text-brand-muted">
        Referencial — el diseño final puede variar según empaque del pack
      </p>
    </div>
  );
}
