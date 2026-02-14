import { MapPin, ShoppingCart, MessageCircle, Facebook, Instagram, Video, ExternalLink, ChevronRight } from 'lucide-react';

const links = [
  {
    title: 'Tienda Online',
    subtitle: 'Pide directo en la Web',
    url: 'https://www.dondemorales.cl/',
    icon: ShoppingCart,
    color: 'bg-orange-600',
    hoverColor: 'group-hover:text-orange-600',
    ring: 'ring-1 ring-orange-100',
    hasBlob: true,
  },
  {
    title: 'WhatsApp',
    subtitle: 'Atención al cliente',
    url: 'https://wa.me/56975647756',
    icon: MessageCircle,
    color: 'bg-[#25D366]',
    hoverColor: 'group-hover:text-[#25D366]',
  },
  {
    title: 'Facebook del Día',
    subtitle: 'Ofertas y Noticias',
    url: 'https://www.facebook.com/profile.php?id=61587659169721',
    icon: Facebook,
    color: 'bg-[#1877F2]',
    hoverColor: 'group-hover:text-[#1877F2]',
  },
  {
    title: 'Instagram',
    subtitle: 'Fotos y Antojos',
    url: 'https://www.instagram.com/restaurantdondemorales/',
    icon: Instagram,
    color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600',
    hoverColor: 'group-hover:text-pink-500',
  },
  {
    title: 'TikTok',
    subtitle: 'Videos Divertidos',
    url: 'https://www.tiktok.com/@dondemorales',
    iconText: '♪',
    color: 'bg-black',
    hoverColor: 'group-hover:text-black',
  },
  {
    title: 'Facebook Live',
    subtitle: 'Transmisiones en Vivo',
    url: 'https://www.facebook.com/donde.morales.7',
    icon: Video,
    color: 'bg-red-600',
    hoverColor: 'group-hover:text-red-600',
    ring: 'ring-1 ring-red-50',
  },
];

export default function BioPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-6 sm:p-6 font-sans">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg space-y-4">

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 leading-tight">Donde Morales</h1>
          <p className="text-slate-500 text-base">Renaico</p>
        </div>

        {/* Mapa / Ubicación */}
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación</span>
            <span className="text-xs text-slate-500">
              <MapPin className="inline h-3 w-3 text-red-500 mr-1" /> Santiago Watt 205
            </span>
          </div>

          <div className="rounded-xl overflow-hidden h-40 w-full relative bg-slate-200 border border-slate-100">
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src="https://maps.google.com/maps?q=Santiago+Watt+205,+Renaico&t=&z=15&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
            />
          </div>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Santiago+Watt+205,+Renaico"
            target="_blank"
            className="mt-3 flex items-center justify-center w-full py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-600 hover:text-white transition-colors"
          >
            <MapPin className="h-4 w-4 mr-2" /> Cómo llegar (GPS)
          </a>
        </div>

        {/* Links */}
        {links.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            className={`group flex items-center w-full p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-slate-100 relative overflow-hidden ${link.ring || ''}`}
          >
            {link.hasBlob && (
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full -mr-8 -mt-8 opacity-50 transition-transform group-hover:scale-150" />
            )}

            <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl ${link.color} text-white text-2xl shadow-sm group-hover:scale-110 transition-transform z-10`}>
              {link.icon ? <link.icon className="h-6 w-6" /> : <span className="text-xl font-bold">{link.iconText}</span>}
            </div>
            <div className="ml-4 flex-grow z-10">
              <h3 className="font-bold text-slate-800 text-lg">{link.title}</h3>
              <p className={`text-xs ${link.title === 'Tienda Online' ? 'font-medium text-orange-600' : 'text-slate-500'}`}>
                {link.subtitle}
              </p>
            </div>
            <div className="z-10">
              {link.title === 'Tienda Online' ? (
                <ExternalLink className={`h-4 w-4 text-slate-300 ${link.hoverColor}`} />
              ) : (
                <ChevronRight className={`h-4 w-4 text-slate-300 ${link.hoverColor}`} />
              )}
            </div>
          </a>
        ))}

        {/* Footer */}
        <div className="text-center pt-6 text-slate-400 text-xs pb-4">
          <p>&copy; {new Date().getFullYear()} Donde Morales</p>
        </div>

      </div>
    </div>
  );
}
