/** Imagen estática de respaldo para tarjetas /packs (sin tocar fotos de producto en BD). */
export function packReferenceImage(nombre: string, seccionId?: string): string {
  const n = nombre.toLowerCase();

  if (n.includes('yogurt') || n.includes('yogen')) return '/images/helados/yogen-mix.png';
  if (n.includes('soft')) return '/images/helados/copa-biscoff.png';
  if (n.includes('artesanal')) return '/images/helados/chocobomba.png';
  if (n.includes('combo helado') || n.includes('helado + bebida')) return '/images/helados/copa-berries.png';
  if (n.includes('helado') && n.includes('regalo')) return '/images/helados/copa-tropical.png';

  if (n.includes('chorrillana') || n.includes('familiar toppi')) return '/images/salada/chorrillana.png';
  if (n.includes('completo')) return '/images/salada/completo.png';
  if (n.includes('papas')) return '/images/salada/base-salada.png';
  if (n.includes('almuerzo')) return '/images/salada/wok.png';

  if (n.includes('desayuno')) return '/images/regalos/pack-desayuno-clasico.png';
  if (n.includes('once')) return '/images/regalos/pack-once-familiar.png';
  if (n.includes('cumpleaños') || n.includes('cumpleanos')) {
    if (n.includes('mamá') || n.includes('mama')) return '/images/regalos/pack-cumpleanos-dulce.png';
    return '/images/regalos/pack-cumpleanos-dulce.png';
  }
  if (n.includes('corporativo')) return '/images/regalos/pack-corporativo.png';
  if (n.includes('pareja') || n.includes('amor')) return '/images/regalos/pack-amor-espumante.png';
  if (n.includes('condolencias')) return '/images/regalos/pack-condolencias.png';

  if (seccionId === 'helados') return '/images/hero-toppis.png';
  if (seccionId === 'comida') return '/images/hero-salada.png';
  if (seccionId === 'regalos') return '/images/hero-regalos.png';

  return '/images/hero-toppis.png';
}

export const SECCION_THEME: Record<
  string,
  {
    sectionTint: string;
    sectionBorder: string;
    bgOpacity: string;
    cardBorder: string;
    cardHover: string;
    btn: string;
    kicker: string;
  }
> = {
  helados: {
    sectionTint: 'from-fuchsia-100/90 via-white/75 to-violet-100/60',
    sectionBorder: 'border-fuchsia-200/70',
    bgOpacity: 'opacity-[0.28]',
    cardBorder: 'border-fuchsia-300/25',
    cardHover: 'hover:border-fuchsia-400/45 hover:shadow-fuchsia-900/15',
    btn: 'bg-gradient-to-r from-fuchsia-600 to-violet-700 hover:from-fuchsia-500 hover:to-violet-600',
    kicker: 'text-fuchsia-700',
  },
  comida: {
    sectionTint: 'from-amber-100/90 via-white/75 to-orange-100/55',
    sectionBorder: 'border-amber-200/70',
    bgOpacity: 'opacity-[0.26]',
    cardBorder: 'border-amber-300/25',
    cardHover: 'hover:border-amber-400/45 hover:shadow-orange-900/12',
    btn: 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600',
    kicker: 'text-amber-800',
  },
  regalos: {
    sectionTint: 'from-rose-100/90 via-white/75 to-pink-100/55',
    sectionBorder: 'border-rose-200/70',
    bgOpacity: 'opacity-[0.26]',
    cardBorder: 'border-rose-300/25',
    cardHover: 'hover:border-rose-400/45 hover:shadow-rose-900/12',
    btn: 'bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600',
    kicker: 'text-rose-800',
  },
};
