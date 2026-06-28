'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';

const STORAGE_KEY = 'dm_pack_favoritos_v1';

export type PackFavorito = {
  idproducto: number;
  nombre: string;
  precio?: number | null;
  imagen_url?: string | null;
  ocasion?: string;
  savedAt: number;
};

function readStorage(): PackFavorito[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PackFavorito[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items: PackFavorito[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function usePackFavoritos() {
  const [favoritos, setFavoritos] = useState<PackFavorito[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    setFavoritos(readStorage());
  }, []);

  const isFavorite = useCallback(
    (idproducto?: number | null) => {
      if (!idproducto) return false;
      return favoritos.some((f) => f.idproducto === idproducto);
    },
    [favoritos],
  );

  const toggleFavorite = useCallback(
    (item: Omit<PackFavorito, 'savedAt'>) => {
      if (!item.idproducto) return;
      setFavoritos((prev) => {
        const exists = prev.some((f) => f.idproducto === item.idproducto);
        const next = exists
          ? prev.filter((f) => f.idproducto !== item.idproducto)
          : [{ ...item, savedAt: Date.now() }, ...prev].slice(0, 24);
        writeStorage(next);
        if (exists) {
          showToast('Quitado de favoritos');
        } else {
          showToast('Pack guardado en favoritos', { label: 'Ver favoritos', href: '/regalos#regalos-favoritos' });
        }
        return next;
      });
    },
    [showToast],
  );

  const removeFavorite = useCallback(
    (idproducto: number) => {
      setFavoritos((prev) => {
        const next = prev.filter((f) => f.idproducto !== idproducto);
        writeStorage(next);
        return next;
      });
      showToast('Quitado de favoritos');
    },
    [showToast],
  );

  return { favoritos, isFavorite, toggleFavorite, removeFavorite };
}
