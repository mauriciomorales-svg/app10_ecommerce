'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, X } from 'lucide-react';
import type { PackFavorito } from '../hooks/usePackFavoritos';
import { toCLP } from '../lib/money';
import PackShareActions from './PackShareActions';

type Props = {
  favoritos: PackFavorito[];
  onRemove: (idproducto: number) => void;
};

export default function RegalosFavoritosPanel({ favoritos, onRemove }: Props) {
  if (favoritos.length === 0) return null;

  return (
    <section
      id="regalos-favoritos"
      className="mb-6 scroll-mt-24 rounded-[1.35rem] border border-rose-200/70 bg-gradient-to-br from-rose-50/90 via-white to-pink-50/50 p-4 shadow-premium sm:p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
        <h2 className="font-display text-lg font-extrabold text-brand-ink">Tus packs guardados</h2>
        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
          {favoritos.length}
        </span>
      </div>
      <p className="mb-3 text-xs text-brand-muted">
        Guardados en este navegador — comparte por WhatsApp o reserva cuando quieras.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {favoritos.map((fav) => (
          <article
            key={fav.idproducto}
            className="relative flex gap-3 rounded-xl border border-rose-100 bg-white p-3 shadow-sm"
          >
            <button
              type="button"
              className="absolute right-2 top-2 rounded-full p-1 text-brand-muted hover:bg-rose-50 hover:text-rose-700"
              aria-label="Quitar de favoritos"
              onClick={() => onRemove(fav.idproducto)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-rose-50 ring-1 ring-rose-100">
              {fav.imagen_url ? (
                <Image src={fav.imagen_url} alt={fav.nombre} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Heart className="h-5 w-5 text-rose-300" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <h3 className="line-clamp-2 text-sm font-bold text-brand-ink">{fav.nombre}</h3>
              {fav.precio != null && (
                <p className="mt-0.5 text-sm font-extrabold text-rose-700">{toCLP(fav.precio)}</p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href={`/producto/${fav.idproducto}`}
                  className="text-[10px] font-bold text-brand-primary underline"
                >
                  Reservar
                </Link>
              </div>
              <PackShareActions
                pack={{
                  nombre: fav.nombre,
                  precio: fav.precio,
                  idproducto: fav.idproducto,
                  ocasion: fav.ocasion,
                }}
                variant="light"
                compact
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
