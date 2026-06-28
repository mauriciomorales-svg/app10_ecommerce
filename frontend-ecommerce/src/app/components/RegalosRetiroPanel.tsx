'use client';

import { ExternalLink, MapPin, Clock } from 'lucide-react';
import type { RegalosExperienciaBlock } from '../context/RegalosExperienciaContext';

type Props = {
  retiro?: RegalosExperienciaBlock['retiro'];
};

export default function RegalosRetiroPanel({ retiro }: Props) {
  if (!retiro?.direccion) return null;

  return (
    <section className="mb-6">
      <div className="flex flex-col gap-3 rounded-[1.15rem] border border-slate-200/80 bg-white/90 p-4 shadow-premium sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <p className="text-sm font-bold text-brand-ink">Retiro en local</p>
            <p className="text-sm text-brand-muted">{retiro.direccion}</p>
            {retiro.horario && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-muted">
                <Clock className="h-3.5 w-3.5" />
                {retiro.horario}
              </p>
            )}
            {retiro.armado_horas != null && retiro.armado_horas > 0 && (
              <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                Packs y regalos: armamos con al menos {retiro.armado_horas} h de anticipación
              </p>
            )}
          </div>
        </div>
        {retiro.maps_url && (
          <a
            href={retiro.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-800 hover:bg-rose-100"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir en Maps
          </a>
        )}
      </div>
    </section>
  );
}
