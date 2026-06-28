'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  CalendarCheck,
  Gift,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { toCLP } from '../lib/money';

type OcasionChip = { id: string; label: string };

type CorporativoCfg = {
  titulo?: string;
  subtitulo?: string;
  nombre_pack?: string;
  precio_10_mas?: number;
  precio_unidad?: number;
  imagen?: string;
  whatsapp_prefill?: string;
};

type ConfianzaItem = { icon?: string; texto: string };

type LandingData = {
  ocasiones?: OcasionChip[];
  corporativo?: CorporativoCfg;
  confianza?: ConfianzaItem[];
  corporativo_form?: { campos?: { key: string; label: string; placeholder?: string }[] };
  retiro?: { direccion?: string; horario?: string; maps_url?: string };
};

const CONFIANZA_ICON: Record<string, typeof ShieldCheck> = {
  shield: ShieldCheck,
  calendar: CalendarCheck,
  gift: Gift,
  truck: Truck,
};

const WHATSAPP = '56975647756';

function whatsappHref(text: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}

export function useRegaloOcasionFilter() {
  const searchParams = useSearchParams();
  const [ocasion, setOcasion] = useState('todos');

  useEffect(() => {
    const fromUrl = searchParams.get('ocasion');
    if (fromUrl) setOcasion(fromUrl);
  }, [searchParams]);

  const setOcasionWithUrl = (id: string) => {
    setOcasion(id);
    const url = new URL(window.location.href);
    if (id === 'todos') {
      url.searchParams.delete('ocasion');
    } else {
      url.searchParams.set('ocasion', id);
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  return { ocasion, setOcasion: setOcasionWithUrl };
}

export function matchesOcasion(itemOcasion: string | undefined, filter: string): boolean {
  if (filter === 'todos') return true;
  if (!itemOcasion) return false;
  return itemOcasion === filter;
}

type Props = {
  data: LandingData | null;
  ocasion: string;
  onOcasionChange: (id: string) => void;
};

export default function RegalosOcasionLanding({ data, ocasion, onOcasionChange }: Props) {
  const chips = data?.ocasiones ?? [];
  const corp = data?.corporativo ?? {};
  const showCorporativo = ocasion === 'todos' || ocasion === 'corporativo';
  const isCondolencias = ocasion === 'condolencias';
  const formCampos = data?.corporativo_form?.campos ?? [];
  const [corpFields, setCorpFields] = useState<Record<string, string>>({});

  const corpWhatsapp = useMemo(() => {
    const base =
      corp.whatsapp_prefill ??
      'Hola, quiero cotizar packs corporativos DondeMorales. Cantidad: ___ · Fecha: ___ · Empresa: ___';
    const extras = formCampos
      .map((c) => `${c.label}: ${corpFields[c.key]?.trim() || '___'}`)
      .join(' · ');
    const text = formCampos.length > 0 && Object.values(corpFields).some(Boolean)
      ? `Hola, quiero cotizar packs corporativos DondeMorales. ${extras}`
      : base;
    return whatsappHref(text);
  }, [corp.whatsapp_prefill, formCampos, corpFields]);

  return (
    <section className={`mb-8 ${isCondolencias ? 'regalos-skin-condolencias' : ''}`}>
      {isCondolencias && (
        <div className="mb-4 rounded-xl border border-slate-300/80 bg-gradient-to-r from-slate-100 to-stone-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-800">Ocasión de condolencias</p>
          <p className="mt-0.5 text-xs text-slate-600">
            Tonos sobrios y empaque respetuoso — retiro en local o coordinamos contigo por WhatsApp.
          </p>
        </div>
      )}
      <div className={`relative overflow-hidden rounded-[1.65rem] border shadow-premium-lg ${
        isCondolencias
          ? 'border-slate-300/60'
          : 'border-rose-200/60'
      }`}>
        <div className="relative h-44 sm:h-52">
          <Image
            src={isCondolencias ? '/images/regalos/pack-condolencias.png' : '/images/hero-regalos.png'}
            alt="Regalos DondeMorales — Santiago Watt 205, Renaico"
            fill
            priority
            className={`object-cover ${isCondolencias ? 'grayscale-[30%]' : ''}`}
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${
            isCondolencias
              ? 'from-slate-950/95 via-slate-900/50'
              : 'from-rose-950/95 via-rose-950/50'
          } to-transparent`} />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <span className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${
              isCondolencias
                ? 'bg-white/10 text-slate-100 ring-white/20'
                : 'bg-white/15 text-rose-100 ring-white/20'
            }`}>
              <Sparkles className="h-3.5 w-3.5" />
              Retiro · {data?.retiro?.direccion ?? 'Santiago Watt 205, Renaico'}
            </span>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              ¿Cuál es tu regalo Toppi&apos;s?
            </h1>
            <p className="mt-1 max-w-xl text-sm text-rose-100/90">
              Tu ocasión, tu mensaje — pack listo o lo diseñas tú. Envío gratis regalo en Renaico.
            </p>
            <p className="mt-2 max-w-xl text-[11px] text-rose-100/75">
              Imagen referencial del pack. Lo que importa es la lista «Incluye» — productos reales del local.
            </p>
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="premium-chip-row mt-5">
          {chips.map((chip) => {
            const active = ocasion === chip.id;
            const isCond = chip.id === 'condolencias';
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onOcasionChange(chip.id)}
                className={`premium-chip ${
                  active
                    ? isCond
                      ? 'border-slate-600 bg-slate-700 text-white shadow-md'
                      : 'border-rose-600 bg-rose-600 text-white shadow-md'
                    : isCond
                      ? 'premium-chip-idle hover:border-slate-400 hover:bg-slate-50'
                      : 'premium-chip-idle hover:border-rose-300 hover:bg-rose-50'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}

      {(data?.confianza?.length ?? 0) > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {data!.confianza!.map((item) => {
            const Icon = CONFIANZA_ICON[item.icon ?? ''] ?? Gift;
            return (
              <div
                key={item.texto}
                className="flex items-start gap-2 rounded-xl border border-rose-100 bg-white/80 px-3 py-2.5 text-xs text-brand-muted"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <span>{item.texto}</span>
              </div>
            );
          })}
        </div>
      )}

      {showCorporativo && corp.titulo && (
        <div
          id="regalo-corporativo"
          className="mt-6 scroll-mt-24 overflow-hidden rounded-[1.35rem] border border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 p-4 shadow-premium sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {corp.imagen && (
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-40">
                <Image src={corp.imagen} alt={corp.nombre_pack ?? 'Pack corporativo'} fill className="object-cover" sizes="160px" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                <Building2 className="h-3 w-3" />
                B2B
              </span>
              <h2 className="mt-1 font-display text-lg font-extrabold text-brand-ink">{corp.titulo}</h2>
              {corp.subtitulo && <p className="mt-1 text-sm text-brand-muted">{corp.subtitulo}</p>}
              {formCampos.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {formCampos.map((campo) => (
                    <div key={campo.key}>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                        {campo.label}
                      </label>
                      <input
                        type="text"
                        value={corpFields[campo.key] ?? ''}
                        onChange={(e) =>
                          setCorpFields((prev) => ({ ...prev, [campo.key]: e.target.value }))
                        }
                        placeholder={campo.placeholder}
                        className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {corp.precio_10_mas != null && (
                  <p>
                    <span className="font-bold text-emerald-800">10+ u.:</span>{' '}
                    {toCLP(corp.precio_10_mas)} c/u
                  </p>
                )}
                {corp.precio_unidad != null && (
                  <p>
                    <span className="font-bold text-brand-muted">1 u.:</span> {toCLP(corp.precio_unidad)}
                  </p>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={corpWhatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  Cotizar por WhatsApp
                </a>
                <Link
                  href="/packs#packs-regalos"
                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-bold text-emerald-900 hover:bg-emerald-50"
                >
                  Ver en packs
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
