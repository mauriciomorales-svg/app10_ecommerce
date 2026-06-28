import {
  MapPin,
  ShoppingCart,
  MessageCircle,
  Facebook,
  Instagram,
  Video,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import Logo from '../components/Logo';

const WHATSAPP = 'https://wa.me/56975647756';

const links = [
  {
    title: 'Tienda Online',
    subtitle: 'Pide directo en la web',
    url: 'https://www.dondemorales.cl/?utm_source=facebook&utm_medium=bio&utm_campaign=tienda',
    icon: ShoppingCart,
    featured: true,
  },
  {
    title: 'WhatsApp',
    subtitle: 'Atención al cliente',
    url: WHATSAPP,
    icon: MessageCircle,
    color: 'bg-[#25D366]',
  },
  {
    title: 'Facebook del Día',
    subtitle: 'Ofertas y noticias',
    url: 'https://www.facebook.com/profile.php?id=61587659169721',
    icon: Facebook,
    color: 'bg-[#1877F2]',
  },
  {
    title: 'Instagram',
    subtitle: 'Fotos y antojos',
    url: 'https://www.instagram.com/restaurantdondemorales/',
    icon: Instagram,
    color: 'bg-gradient-to-tr from-amber-400 via-red-500 to-purple-600',
  },
  {
    title: 'TikTok',
    subtitle: 'Videos del local',
    url: 'https://www.tiktok.com/@dondemorales',
    iconText: '♪',
    color: 'bg-brand-ink',
  },
  {
    title: 'Facebook Live',
    subtitle: 'Transmisiones en vivo',
    url: 'https://www.facebook.com/donde.morales.7',
    icon: Video,
    color: 'bg-red-600',
  },
];

export default function BioPage() {
  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <p className="text-brand-muted text-sm font-medium">Renaico · Araucanía, Chile</p>
          <p className="text-xs text-slate-400 mt-1">Lun–Dom 9:00 – 21:00</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Ubicación</span>
            <span className="text-xs text-brand-ink flex items-center gap-1">
              <MapPin className="h-3 w-3 text-red-500" />
              Watt 205
            </span>
          </div>
          <div className="rounded-xl overflow-hidden h-40 w-full bg-slate-100 border border-slate-100">
            <iframe
              title="Mapa DondeMorales"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src="https://maps.google.com/maps?q=Santiago+Watt+205,+Renaico&t=&z=15&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
            />
          </div>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Santiago+Watt+205,+Renaico"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center w-full py-2.5 bg-brand-primary/10 text-brand-primary rounded-xl font-bold text-sm hover:bg-brand-primary hover:text-white transition-colors"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Cómo llegar (GPS)
          </a>
        </div>

        {links.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center w-full p-4 rounded-2xl shadow-card border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover ${
              link.featured
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'bg-white border-slate-100'
            }`}
          >
            <div
              className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl text-white text-2xl shadow-sm ${
                link.featured ? 'bg-brand-accent text-brand-ink' : link.color || 'bg-brand-primary'
              }`}
            >
              {link.icon ? (
                <link.icon className="h-6 w-6" />
              ) : (
                <span className="text-xl font-bold">{link.iconText}</span>
              )}
            </div>
            <div className="ml-4 flex-grow min-w-0">
              <h3
                className={`font-display font-bold text-lg truncate ${
                  link.featured ? 'text-white' : 'text-brand-ink'
                }`}
              >
                {link.title}
              </h3>
              <p
                className={`text-xs truncate ${
                  link.featured ? 'text-emerald-100' : 'text-brand-muted'
                }`}
              >
                {link.subtitle}
              </p>
            </div>
            <div className="shrink-0 ml-2">
              {link.featured ? (
                <ExternalLink className="h-4 w-4 text-emerald-200" />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-brand-primary" />
              )}
            </div>
          </a>
        ))}

        <p className="text-center pt-4 text-slate-400 text-xs">
          © {new Date().getFullYear()} DondeMorales
        </p>
      </div>
    </div>
  );
}
