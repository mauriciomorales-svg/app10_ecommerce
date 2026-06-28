'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IceCream, Gift, Sparkles, Package, ArrowRight, Loader2 } from 'lucide-react';

type Block = {
  title: string;
  tagline: string;
  description: string;
  categoria: { idcategoria: number; nombre: string } | null;
};

type Empaques = {
  titulo: string;
  items: { icon: string; text: string }[];
  free_reinforced_from: number;
  free_gift_box_from: number;
  gift_box_label: string;
};

function fmt(n: number) {
  return n.toLocaleString('es-CL');
}

export default function ExperienceHub() {
  const [toppis, setToppis] = useState<Block | null>(null);
  const [regalos, setRegalos] = useState<Block | null>(null);
  const [empaques, setEmpaques] = useState<Empaques | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tienda/experiencias-home')
      .then((r) => r.json())
      .then((data) => {
        setToppis(data.toppis ?? null);
        setRegalos(data.regalos ?? null);
        setEmpaques(data.empaques ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-6 w-6 text-brand-primary animate-spin" />
      </div>
    );
  }

  if (!toppis && !regalos) return null;

  const catLink = (cat: { idcategoria: number } | null, hash: string) =>
    cat ? `/?categoria=${cat.idcategoria}#${hash}` : `#${hash}`;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-4">
      <div className="text-center sm:text-left">
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-primary mb-1">
          Elige tu experiencia
        </p>
        <h2 className="font-display font-bold text-xl sm:text-2xl text-brand-ink">
          ¿Minimarket, Toppi&apos;s o un regalo?
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        {toppis && (
          <Link
            href={catLink(toppis.categoria, 'experiencia-toppis')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-700 text-white p-5 sm:p-6 shadow-card-hover min-h-[160px] flex flex-col justify-between"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3">
                <IceCream className="h-3.5 w-3.5" />
                Modelo Toppi&apos;s
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl leading-tight">{toppis.title}</h3>
              <p className="text-sm text-cyan-50/95 mt-1 font-medium">{toppis.tagline}</p>
              <p className="text-xs text-cyan-100/80 mt-2 line-clamp-2 hidden sm:block">{toppis.description}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold bg-white text-teal-800 w-fit px-4 py-2 rounded-xl group-hover:bg-brand-accent transition-colors">
              Arma tu pedido
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        )}

        {regalos && (
          <Link
            href={catLink(regalos.categoria, 'experiencia-regalos')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-violet-800 text-white p-5 sm:p-6 shadow-card-hover min-h-[160px] flex flex-col justify-between"
          >
            <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-white/10" />
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3">
                <Gift className="h-3.5 w-3.5" />
                Regalos
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl leading-tight">{regalos.title}</h3>
              <p className="text-sm text-rose-50/95 mt-1 font-medium">{regalos.tagline}</p>
              <p className="text-xs text-rose-100/80 mt-2 line-clamp-2 hidden sm:block">{regalos.description}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold bg-white text-rose-800 w-fit px-4 py-2 rounded-xl group-hover:bg-brand-accent transition-colors">
              Personalizar regalo
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        )}
      </div>

      {empaques && (
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50/80 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 shrink-0">
            <Package className="h-5 w-5 text-amber-700" />
            <span className="font-bold text-sm text-amber-950">{empaques.titulo}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-900/90">
            {empaques.items?.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-600" />
                {item.text}
              </span>
            ))}
            <span className="text-amber-800 font-semibold">
              Bolsa reforzada gratis desde ${fmt(empaques.free_reinforced_from)}
            </span>
            <span className="text-amber-800 font-semibold">
              {empaques.gift_box_label} gratis desde ${fmt(empaques.free_gift_box_from)}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
