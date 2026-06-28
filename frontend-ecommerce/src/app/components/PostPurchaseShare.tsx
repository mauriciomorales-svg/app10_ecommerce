'use client';

import { MessageCircle, Share2 } from 'lucide-react';

const WHATSAPP = '56975647756';

type Props = {
  codigoRetiro?: string;
  packNombre?: string;
};

export default function PostPurchaseShare({ codigoRetiro, packNombre }: Props) {
  const shareText = packNombre
    ? `Reservé un regalo Toppi's en DondeMorales (${packNombre}). ¿Te tinca uno? https://dondemorales.cl/regalos`
    : `Acabo de reservar en DondeMorales (Toppi's). Mira los packs regalo: https://dondemorales.cl/regalos`;

  const waText = codigoRetiro
    ? `Hola, confirmé mi pedido DondeMorales. Código: ${codigoRetiro}. ¿Pueden confirmar fecha de retiro?`
    : shareText;

  const share = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Regalo Toppi\'s · DondeMorales',
          text: shareText,
          url: 'https://dondemorales.cl/regalos',
        });
        return;
      } catch {
        /* fallback */
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-left">
      <p className="text-sm font-bold text-brand-ink">¿Conoces a alguien que regalaría?</p>
      <p className="mt-0.5 text-xs text-brand-muted">
        Comparte la tienda de regalos o confirma tu retiro por WhatsApp
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={share}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-rose-800 ring-1 ring-rose-200 hover:bg-rose-50"
        >
          <Share2 className="h-4 w-4" />
          Compartir regalos
        </button>
        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(waText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp local
        </a>
      </div>
    </div>
  );
}
