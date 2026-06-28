import { Clock, MapPin, MessageCircle, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';

type TrustItem = {
  Icon: LucideIcon;
  title: string;
  text: string;
  iconBg: string;
  iconColor: string;
  href?: string;
};

const WHATSAPP = 'https://wa.me/56975647756';

const ITEMS: TrustItem[] = [
  {
    Icon: Truck,
    title: 'Reparto Renaico',
    text: 'Ventanas almuerzo y cena · packs y combos · desde $2.000 envío comuna',
    iconBg: 'bg-brand-primary/10',
    iconColor: 'text-brand-primary',
  },
  {
    Icon: MapPin,
    title: 'Retiro en tienda',
    text: 'Watt 205 · gratis con tu código tras pagar online',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-brand-primary',
  },
  {
    Icon: Clock,
    title: 'Horario',
    text: 'Lun–Dom 9:00 a 21:00',
    iconBg: 'bg-brand-primary/10',
    iconColor: 'text-brand-primary',
  },
  {
    Icon: ShieldCheck,
    title: 'Pago seguro',
    text: 'Procesado por Flow.cl y Mercado Pago',
    iconBg: 'bg-brand-success/10',
    iconColor: 'text-brand-success',
  },
  {
    Icon: MessageCircle,
    title: 'Consultas',
    text: 'Dudas sobre tu pedido — no es canal de compra',
    iconBg: 'bg-slate-100',
    iconColor: 'text-brand-muted',
    href: WHATSAPP,
  },
];

function TrustCard({ item }: { item: TrustItem }) {
  const inner = (
    <>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
        <item.Icon className={`h-5 w-5 ${item.iconColor}`} />
      </div>
      <div>
        <p className="font-display font-bold text-brand-ink">{item.title}</p>
        <p className="mt-0.5 text-xs text-brand-muted">{item.text}</p>
      </div>
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-panel flex gap-3 rounded-[1.25rem] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg"
      >
        {inner}
      </a>
    );
  }

  return (
    <div className="glass-panel flex gap-3 rounded-[1.25rem] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-lg">
      {inner}
    </div>
  );
}

export default function TrustBlock() {
  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
      <div className="premium-section-head mb-5">
        <span className="premium-kicker">Confianza local</span>
        <h2 className="premium-heading">¿Por qué DondeMorales?</h2>
        <p className="mt-1 text-sm text-brand-muted">Comercio local real en Renaico, Araucanía</p>
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <TrustCard key={item.title} item={item} />
        ))}
      </div>

      <div className="glass-panel mt-4 overflow-hidden rounded-[1.35rem]">
        <div className="flex items-center gap-2 border-b border-slate-100/80 px-4 py-3">
          <MapPin className="h-4 w-4 text-red-500" />
          <span className="font-display text-sm font-semibold text-brand-ink">
            Santiago Watt 205, Renaico
          </span>
        </div>
        <div className="relative h-44 w-full bg-slate-100 sm:h-52">
          <iframe
            title="Ubicación DondeMorales"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src="https://maps.google.com/maps?q=Santiago+Watt+205,+Renaico&t=&z=15&ie=UTF8&iwloc=&output=embed"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
