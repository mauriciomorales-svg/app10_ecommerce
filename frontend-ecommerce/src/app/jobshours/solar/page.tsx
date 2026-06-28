import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Handshake, MapPin, Phone, Home } from 'lucide-react';

const SITE = 'https://tienda.jobshours.com';
const WA = '56965519247';
const WA_DISPLAY = '+56 9 6551 9247';
const WA_MSG = encodeURIComponent(
  'Hola Energy Systems, vivo en [tu comuna] y quiero cotizar paneles solares. Podemos coordinar una visita?',
);
const FB = 'https://www.facebook.com/profile.php?id=61586463385029';
const HERO = '/jobshours/energy-systems/solar-instalacion-hero.png';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Paneles solares | Energy Systems Chile | Angol y Malleco',
  description:
    'Instalacion solar con declaracion SEC (TE4). Empresa de Angol: te visitamos, cotizamos claro y te acompanamos hasta la conexion. Malleco y provincia del Biobio.',
  alternates: { canonical: '/solar' },
  openGraph: {
    title: 'Solar con tramite SEC | Energy Systems Chile',
    description: 'Gente de la zona. Visita sin compromiso por WhatsApp.',
    url: '/solar',
    locale: 'es_CL',
    type: 'website',
    images: [{ url: HERO, width: 1200, height: 800, alt: 'Instalacion de paneles solares en Angol' }],
  },
};

const ITEMS = [
  { Icon: Home, t: 'Te vamos a ver', d: 'Visita en tu casa o negocio, sin compromiso.' },
  { Icon: Handshake, t: 'Trato directo', d: 'Mismo equipo desde la cotizacion hasta el TE4.' },
  { Icon: MapPin, t: 'Zona Malleco y Biobio', d: 'Angol, Renaico, Los Angeles y comunas cercanas.' },
  { Icon: CheckCircle2, t: 'Instalador SEC', d: 'Trabajo conforme a normativa chilena vigente.' },
] as const;

export default function EnergySystemsSolarPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-sky-50 text-slate-900">
      <div className="relative mx-auto max-w-lg">
        <div className="relative h-52 w-full overflow-hidden sm:h-60">
          <Image
            src={HERO}
            alt="Tecnico instalando paneles solares en techo, Energy Systems Chile"
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 512px) 100vw, 512px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sky-950/90 via-sky-950/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Energy Systems Chile</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight">Solar con tramite SEC</h1>
            <p className="mt-1 text-sm font-medium text-sky-100">Angol | Malleco | Provincia del Biobio</p>
          </div>
          <span className="absolute right-3 top-3 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-100 backdrop-blur-sm">
            Empresa local
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-5 px-4 py-6">
        <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-sky-800">Hola, somos de Angol</p>
          <h2 className="mt-2 text-2xl font-extrabold leading-snug text-slate-900">
            Baja la cuenta de luz con paneles solares, sin tramites que te enreden
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            No hablas con un call center de Santiago. Te visitamos, miramos tu techo y tablero, y te explicamos
            en simple cuanto podes ahorrar. Instalamos y dejamos la declaracion <strong>TE4</strong> ante la SEC
            para conectar legal a la red.
          </p>
        </section>

        <section className="grid gap-3">
          {ITEMS.map(({ Icon, t, d }) => (
            <div
              key={t}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Icon className="mt-0.5 h-6 w-6 shrink-0 text-sky-700" aria-hidden />
              <div>
                <p className="font-bold text-slate-900">{t}</p>
                <p className="text-sm text-slate-600">{d}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-sky-950 p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-300">En 4 pasos</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm font-semibold">
            <li>Nos escribes por WhatsApp (comuna + foto de boleta o tablero)</li>
            <li>Visitamos y cotizamos claro</li>
            <li>Instalamos los paneles</li>
            <li>TE4 SEC + conexion con tu distribuidora</li>
          </ol>
        </section>

        <div className="sticky bottom-0 space-y-3 border-t border-slate-200 bg-gradient-to-t from-white via-white to-white/80 pb-4 pt-3">
          <a
            href={`https://wa.me/${WA}?text=${WA_MSG}`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-4 text-center text-base font-extrabold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700"
          >
            <Phone className="h-5 w-5" aria-hidden />
            Escribir por WhatsApp | {WA_DISPLAY}
          </a>
          <a
            href={FB}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-bold text-sky-800"
          >
            Ver fotos y novedades en Facebook
          </a>
          <p className="text-center text-[11px] leading-relaxed text-slate-500">
            SOFWARE MAURICIO MORALES ENERGY SYSTEMS E.I.R.L. | RUT 78.301.789-K
            <br />
            <Link href="/" className="text-sky-700 underline">
              tienda.jobshours.com
            </Link>{' '}
            | pagina de contacto solar
          </p>
        </div>
      </div>
    </main>
  );
}
