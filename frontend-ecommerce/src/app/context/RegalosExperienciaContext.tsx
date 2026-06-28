'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { PackPremiumCardData } from '../components/PackPremiumCard';

type OcasionChip = { id: string; label: string };
type ConfianzaItem = { icon?: string; texto: string };

export type RegalosExperienciaBlock = {
  retiro?: {
    direccion?: string;
    horario?: string;
    maps_url?: string;
    armado_horas?: number;
  };
  mas_pedidos?: string[];
  quiz?: {
    titulo?: string;
    subtitulo?: string;
    preguntas?: {
      id: string;
      texto: string;
      opciones: { id: string; label: string; ocasion?: string; pack?: string }[];
    }[];
  };
  compare?: {
    titulo?: string;
    subtitulo?: string;
    packs?: {
      nombre: string;
      ocasion?: string;
      modalidad?: string;
      destaca?: string;
      idproducto?: number | null;
      precio?: number | null;
      siempre_incluye?: string[];
    }[];
  };
  checkout_upsell?: {
    titulo?: string;
    subtitulo?: string;
    items?: {
      nombre: string;
      mensaje?: string;
      idproducto?: number | null;
      nombre_producto?: string;
      precio?: number | null;
      imagen_url?: string | null;
    }[];
  };
  comida_porciones?: {
    titulo?: string;
    subtitulo?: string;
    filas?: { personas: string; label: string; detalle: string; buscar: string }[];
  };
  corporativo_form?: {
    campos?: { key: string; label: string; placeholder?: string }[];
  };
  prueba_social?: {
    titulo?: string;
    items?: string[];
  };
};

export type RegalosExperienciaData = {
  regalos_destacados?: {
    title?: string;
    tagline?: string;
    subtitle?: string;
    mensaje_personalizable?: string;
    flujo?: { paso: number; titulo: string; texto: string }[];
    ocasiones?: OcasionChip[];
    corporativo?: Record<string, unknown>;
    confianza?: ConfianzaItem[];
    destacados?: (Record<string, unknown> & { mas_pedido?: boolean })[];
    experiencia?: RegalosExperienciaBlock;
  };
  packs_tarjetas_premium?: {
    title?: string;
    tagline?: string;
    dia_padre?: { activo?: boolean; fecha_label?: string; headline?: string; subheadline?: string };
    dia_padre_comida?: { activo?: boolean; fecha_label?: string; headline?: string; subheadline?: string };
    tarjetas?: (PackPremiumCardData & { mas_pedido?: boolean })[];
  };
};

type Ctx = {
  data: RegalosExperienciaData | null;
  loading: boolean;
  error: boolean;
  reload: () => void;
  premiumNombres: Set<string>;
  experiencia: RegalosExperienciaBlock | null;
};

const RegalosExperienciaContext = createContext<Ctx | null>(null);

export function RegalosExperienciaProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RegalosExperienciaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    setError(false);
    fetch('/api/tienda/experiencias-home')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((json) => {
        setData({
          regalos_destacados: json.regalos_destacados,
          packs_tarjetas_premium: json.packs_tarjetas_premium,
        });
      })
      .catch(() => {
        setData(null);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const premiumNombres = useMemo(() => {
    const names = (data?.packs_tarjetas_premium?.tarjetas ?? []).map((t) => t.nombre);
    return new Set(names);
  }, [data]);

  const experiencia = data?.regalos_destacados?.experiencia ?? null;

  return (
    <RegalosExperienciaContext.Provider value={{ data, loading, error, reload, premiumNombres, experiencia }}>
      {children}
    </RegalosExperienciaContext.Provider>
  );
}

export function useRegalosExperiencia() {
  const ctx = useContext(RegalosExperienciaContext);
  if (!ctx) {
    throw new Error('useRegalosExperiencia debe usarse dentro de RegalosExperienciaProvider');
  }
  return ctx;
}

export function useRegalosExperienciaOptional() {
  return useContext(RegalosExperienciaContext);
}

/** Fetch experiencia block sin provider (p. ej. checkout, salada) */
export function useRegalosExperienciaFetch() {
  const [experiencia, setExperiencia] = useState<RegalosExperienciaBlock | null>(null);

  useEffect(() => {
    fetch('/api/tienda/experiencias-home')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setExperiencia(json?.regalos_destacados?.experiencia ?? null))
      .catch(() => setExperiencia(null));
  }, []);

  return experiencia;
}
