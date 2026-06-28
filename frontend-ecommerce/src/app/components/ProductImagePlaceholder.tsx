'use client';

import { Gift, IceCream, Package, ShoppingBag, Sparkles, UtensilsCrossed } from 'lucide-react';

export type PlaceholderVariant = 'toppis' | 'regalos' | 'salada' | 'pack' | 'retail';

const VARIANTS: Record<
  PlaceholderVariant,
  {
    gradient: string;
    glow: string;
    Icon: typeof IceCream;
    label: string;
    decor: string;
  }
> = {
  toppis: {
    gradient: 'from-cyan-400/30 via-teal-500/20 to-emerald-800/40',
    glow: 'bg-cyan-400/25',
    Icon: IceCream,
    label: "Toppi's",
    decor: 'radial-gradient(circle at 80% 20%, rgba(251,191,36,0.35), transparent 45%)',
  },
  regalos: {
    gradient: 'from-rose-400/35 via-fuchsia-500/25 to-violet-900/40',
    glow: 'bg-rose-400/30',
    Icon: Gift,
    label: 'Regalo',
    decor: 'radial-gradient(circle at 20% 80%, rgba(251,191,36,0.3), transparent 50%)',
  },
  salada: {
    gradient: 'from-amber-400/35 via-orange-500/25 to-red-900/35',
    glow: 'bg-amber-400/30',
    Icon: UtensilsCrossed,
    label: 'Salada',
    decor: 'radial-gradient(circle at 75% 25%, rgba(251,146,60,0.35), transparent 50%)',
  },
  pack: {
    gradient: 'from-amber-300/35 via-orange-400/20 to-brand-primary/35',
    glow: 'bg-amber-400/25',
    Icon: Package,
    label: 'Pack',
    decor: 'radial-gradient(circle at 50% 50%, rgba(245,158,11,0.25), transparent 60%)',
  },
  retail: {
    gradient: 'from-slate-200/80 via-emerald-100/50 to-teal-50/80',
    glow: 'bg-emerald-400/15',
    Icon: ShoppingBag,
    label: 'Producto',
    decor: 'radial-gradient(circle at 70% 30%, rgba(15,76,58,0.12), transparent 55%)',
  },
};

type Props = {
  variant?: PlaceholderVariant;
  nombre?: string;
  className?: string;
};

export function inferPlaceholderVariant(producto: {
  nombre?: string;
  es_pack?: boolean;
  has_bundle_options?: boolean;
  has_customization?: boolean;
  categorias?: { nombre: string }[];
}): PlaceholderVariant {
  const n = (producto.nombre ?? '').toLowerCase();
  const cats = (producto.categorias ?? []).map((c) => c.nombre.toLowerCase()).join(' ');

  if (n.includes('helado') || (cats.includes("toppi") && cats.includes('helado'))) {
    return 'toppis';
  }
  if (
    n.includes('chorrillana') ||
    n.includes('completo') ||
    n.includes('churrasco') ||
    cats.includes('chorrillana') ||
    cats.includes('churrasco')
  ) {
    return 'salada';
  }
  if (
    producto.es_pack ||
    producto.has_bundle_options ||
    n.includes('pack') ||
    n.includes('canasta') ||
    cats.includes('regalo')
  ) {
    return producto.has_customization || producto.has_bundle_options ? 'regalos' : 'pack';
  }
  if (n.includes('regalo') || n.includes('canasta')) return 'regalos';
  return 'retail';
}

export default function ProductImagePlaceholder({
  variant = 'retail',
  nombre,
  className = '',
}: Props) {
  const v = VARIANTS[variant];
  const Icon = v.Icon;

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ background: v.decor }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${v.gradient}`} />
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${v.glow}`}
        aria-hidden
      />
      <div
        className={`absolute -left-4 bottom-0 h-20 w-20 rounded-full blur-xl ${v.glow} opacity-70`}
        aria-hidden
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        <div className="relative mb-2">
          <div className="absolute inset-0 scale-150 rounded-full bg-white/30 blur-md" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/70 shadow-lg backdrop-blur-sm ring-1 ring-white/80">
            <Icon className="h-7 w-7 text-brand-primary/80" strokeWidth={1.75} />
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/70">
          {v.label}
        </span>
        {nombre && (
          <p className="mt-1 line-clamp-2 max-w-[90%] text-[9px] font-medium text-brand-ink/50">
            {nombre}
          </p>
        )}
        <Sparkles
          className="absolute right-3 top-3 h-3.5 w-3.5 text-brand-accent/60"
          aria-hidden
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
