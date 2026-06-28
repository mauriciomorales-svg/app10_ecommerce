'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ProductCardItem } from '../components/ProductCard';
import { apiFetch } from '../lib/api';

export type JobshoursProducto = ProductCardItem & { descripcion?: string; codigobarra?: string };

export function useJobshoursProducts() {
  const [productos, setProductos] = useState<JobshoursProducto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/productos?orden=nombre&per_page=100')
      .then((r) => r.json())
      .then((prodPage) => {
        const list = prodPage?.data ?? prodPage ?? [];
        setProductos(Array.isArray(list) ? list : []);
      })
      .finally(() => setLoading(false));
  }, []);

  const bySku = useMemo(() => {
    const map = new Map<string, JobshoursProducto>();
    for (const p of productos) {
      if (p.codigobarra) map.set(p.codigobarra, p);
    }
    return map;
  }, [productos]);

  return { productos, loading, bySku };
}
