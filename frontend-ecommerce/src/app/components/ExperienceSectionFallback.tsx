'use client';

import Link from 'next/link';
import { AlertCircle, Loader2, MessageCircle, RefreshCw } from 'lucide-react';

type Props = {
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
  className?: string;
};

export default function ExperienceSectionFallback({
  loading,
  error,
  empty,
  emptyMessage = 'No hay contenido disponible por ahora.',
  onRetry,
  children,
  className = '',
}: Props) {
  if (loading) {
    return (
      <div className={`flex justify-center py-10 ${className}`}>
        <Loader2 className="h-7 w-7 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-[1.25rem] border border-amber-200/80 bg-amber-50/90 px-4 py-5 text-center ${className}`}
      >
        <AlertCircle className="mx-auto mb-2 h-8 w-8 text-amber-600" />
        <p className="text-sm font-semibold text-brand-ink">No pudimos cargar esta sección</p>
        <p className="mt-1 text-xs text-brand-muted">
          Puede ser un fallo temporal. Reintenta o consulta por WhatsApp.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-primary-hover"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reintentar
            </button>
          )}
          <Link
            href="/envios"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-brand-ink hover:bg-slate-50"
          >
            Envíos y FAQ
          </Link>
          <a
            href="https://wa.me/56975647756?text=Hola%2C%20la%20web%20no%20carga%20una%20secci%C3%B3n"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-2 text-xs font-bold text-[#128C7E]"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div
        className={`rounded-[1.25rem] border border-slate-200/80 bg-white/80 px-4 py-5 text-center text-sm text-brand-muted ${className}`}
      >
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}
