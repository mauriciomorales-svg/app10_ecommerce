import Link from 'next/link';
import { Suspense } from 'react';
import { ShoppingCart, Truck, Clock, Shield, MapPin, Phone, Heart, Package, ChevronRight, Gift, MessageCircle } from 'lucide-react';
import CartButton from './components/CartButton';
import SearchBar from './components/SearchBar';
import ProductGrid from './components/ProductGrid';
import CategorySidebar from './components/CategorySidebar';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fff5f7]">
      {/* Top Bar - Valentine */}
      <div className="bg-gradient-to-r from-[#880e4f] to-[#ad1457] text-pink-200 text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Santiago Watt 205, Renaico</span>
            <a href="https://wa.me/56976647756" target="_blank" className="hidden sm:flex items-center gap-1 hover:text-white transition-colors"><MessageCircle className="h-3 w-3" /> WhatsApp +56 9 7664 7756</a>
          </div>
          <span className="flex items-center gap-1.5">
            <Heart className="h-3 w-3 fill-pink-300 text-pink-300" />
            <span>Feliz San Valent&iacute;n</span>
            <Heart className="h-3 w-3 fill-pink-300 text-pink-300" />
          </span>
        </div>
      </div>

      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-lg sticky top-0 z-50 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#d81b60] to-[#ff6090] rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-[#1a1a2e] tracking-tight">Donde<span className="text-[#d81b60]">Morales</span></span>
                <p className="text-[10px] text-pink-400 -mt-1 tracking-widest uppercase">Minimarket</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-600 hover:text-[#d81b60] font-medium transition-colors text-sm">Inicio</Link>
              <Link href="/?orden=precio_menor" className="text-gray-600 hover:text-[#d81b60] font-medium transition-colors text-sm flex items-center gap-1">
                <Gift className="h-4 w-4" /> Regalos
              </Link>
              <Suspense><CartButton /></Suspense>
            </div>
            <div className="md:hidden">
              <Suspense><CartButton /></Suspense>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero - Valentine's Day */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#880e4f] via-[#ad1457] to-[#d81b60]"></div>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #ff6090 0%, transparent 50%), radial-gradient(circle at 80% 30%, #f48fb1 0%, transparent 50%)'}}></div>
        
        {/* Floating hearts decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[5%] text-white/10 text-6xl animate-float-heart" style={{animationDelay: '0s'}}>&#10084;</div>
          <div className="absolute top-[20%] right-[10%] text-white/10 text-4xl animate-float-heart" style={{animationDelay: '1s'}}>&#10084;</div>
          <div className="absolute top-[60%] left-[15%] text-white/10 text-3xl animate-float-heart" style={{animationDelay: '2s'}}>&#10084;</div>
          <div className="absolute top-[40%] right-[20%] text-white/10 text-5xl animate-float-heart" style={{animationDelay: '0.5s'}}>&#10084;</div>
          <div className="absolute top-[70%] left-[70%] text-white/10 text-4xl animate-float-heart" style={{animationDelay: '1.5s'}}>&#10084;</div>
          <div className="absolute top-[30%] left-[40%] text-white/10 text-3xl animate-float-heart" style={{animationDelay: '3s'}}>&#10084;</div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-5 py-2.5 mb-6">
              <Heart className="h-4 w-4 text-pink-200 fill-pink-200 animate-pulse-heart" />
              <span className="text-white/95 text-sm font-medium">Especial San Valent&iacute;n 2026</span>
              <Heart className="h-4 w-4 text-pink-200 fill-pink-200 animate-pulse-heart" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
              Regala con<br />
              <span className="bg-gradient-to-r from-[#ff6090] to-[#fce4ec] bg-clip-text text-transparent">todo el coraz&oacute;n</span>
            </h1>
            <p className="text-lg text-pink-100 mb-10 max-w-xl mx-auto">Encuentra el regalo perfecto para esa persona especial</p>
            
            <div className="mb-10">
              <Suspense fallback={<div className="max-w-2xl mx-auto h-14 bg-white/20 rounded-2xl animate-pulse" />}>
                <SearchBar />
              </Suspense>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-300/20 flex items-center justify-center flex-shrink-0">
                  <Gift className="h-5 w-5 text-pink-200" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">Combos regalo</p>
                  <p className="text-pink-200/70 text-xs">Packs especiales</p>
                </div>
              </div>
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-300/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-pink-200" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">Pago seguro</p>
                  <p className="text-pink-200/70 text-xs">Flow & WebPay</p>
                </div>
              </div>
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-300/20 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-5 w-5 text-pink-200" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">Retiro r&aacute;pido</p>
                  <p className="text-pink-200/70 text-xs">Listo en minutos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Valentine Banner */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10 mb-4">
        <div className="bg-gradient-to-r from-[#fce4ec] via-white to-[#fce4ec] rounded-2xl p-5 shadow-lg border border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl animate-pulse-heart">&#10084;&#65039;</div>
            <div>
              <p className="font-bold text-[#ad1457] text-sm">Especial D&iacute;a de los Enamorados</p>
              <p className="text-pink-400 text-xs">Chocolates, peluches, regalos y m&aacute;s para sorprender</p>
            </div>
          </div>
          <Link href="/?categoria=1" className="hidden sm:flex items-center gap-1 bg-[#d81b60] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#ad1457] transition-colors">
            Ver regalos <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Catálogo Regalos San Valentín */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-[#1a1a2e] mb-2">
            <Heart className="h-7 w-7 text-[#d81b60] fill-[#d81b60] inline mr-2 animate-pulse-heart" />
            Cat&aacute;logo San Valent&iacute;n
            <Heart className="h-7 w-7 text-[#d81b60] fill-[#d81b60] inline ml-2 animate-pulse-heart" />
          </h2>
          <p className="text-pink-400">Ideas para sorprender a tu persona especial</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {[
            { emoji: '\ud83c\udf6b', name: 'Chocolates', query: 'chocolate' },
            { emoji: '\ud83e\uddf8', name: 'Osos', query: 'oso' },
            { emoji: '\ud83c\udf39', name: 'Rosas', query: 'rosa' },
            { emoji: '\ud83c\udf81', name: 'Regalos', query: 'regalo set taza corazon' },
            { emoji: '\ud83d\udc8d', name: 'Accesorios', query: 'accesorio' },
            { emoji: '\ud83e\uddf4', name: 'Globos', query: 'globo' },
          ].map((item) => (
            <Link
              key={item.name}
              href={`/?buscar=${encodeURIComponent(item.query)}`}
              className="bg-white rounded-2xl p-5 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-pink-100 group"
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{item.emoji}</div>
              <p className="font-bold text-sm text-[#1a1a2e]">{item.name}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 flex-shrink-0">
            <Suspense fallback={<div className="bg-white rounded-2xl h-96 animate-pulse" />}>
              <CategorySidebar />
            </Suspense>
          </aside>

          <main className="flex-1 min-w-0">
            <Suspense fallback={<div className="flex justify-center py-20"><div className="h-10 w-10 border-4 border-[#d81b60] border-t-transparent rounded-full animate-spin" /></div>}>
              <ProductGrid />
            </Suspense>
          </main>
        </div>
      </div>

      {/* Mapa y WhatsApp */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-pink-100">
            <div className="bg-gradient-to-r from-[#880e4f] to-[#d81b60] p-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Enc&uacute;entranos
              </h3>
            </div>
            <iframe
              src="https://www.google.com/maps?q=Santiago+Watt+205,+Renaico,+Araucan%C3%ADa,+Chile&output=embed"
              width="100%"
              height="280"
              style={{border: 0}}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicaci&oacute;n DondeMorales"
            />
            <div className="p-4">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#d81b60]" /> Santiago Watt 205, Renaico, Araucan&iacute;a
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-pink-100 flex flex-col">
            <div className="bg-gradient-to-r from-[#25d366] to-[#128c7e] p-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5" /> Ped&iacute; por WhatsApp
              </h3>
            </div>
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">&#128140;</div>
              <h4 className="text-xl font-bold text-[#1a1a2e] mb-2">&iquest;Necesitas ayuda con tu regalo?</h4>
              <p className="text-gray-500 mb-6 text-sm">Escr&iacute;benos por WhatsApp y te ayudamos a armar el combo perfecto para San Valent&iacute;n</p>
              <a
                href="https://wa.me/56976647756?text=Hola%21%20Quiero%20consultar%20por%20regalos%20de%20San%20Valent%C3%ADn"
                target="_blank"
                className="inline-flex items-center gap-2 bg-[#25d366] text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#128c7e] transition-colors shadow-lg shadow-green-500/20"
              >
                <MessageCircle className="h-5 w-5" /> Escribir al +56 9 7664 7756
              </a>
              <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Respondemos de 9:00 a 21:00
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-[#1a1a2e] to-[#0d0d1a] text-gray-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#d81b60] to-[#ff6090] rounded-lg flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white fill-white" />
                </div>
                <span className="text-lg font-bold text-white">Donde<span className="text-[#d81b60]">Morales</span></span>
              </div>
              <p className="text-sm leading-relaxed">Tu minimarket de confianza en Renaico. M&aacute;s de 1,900 productos al mejor precio.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Contacto</h4>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#d81b60]" /> Santiago Watt 205, Renaico</p>
                <a href="https://wa.me/56976647756" target="_blank" className="flex items-center gap-2 hover:text-white transition-colors"><MessageCircle className="h-4 w-4 text-[#25d366]" /> +56 9 7664 7756</a>
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#d81b60]" /> Lun-Dom 9:00 - 21:00</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Pagos seguros</h4>
              <div className="flex gap-3">
                <div className="bg-white/10 rounded-lg px-4 py-2 text-xs font-semibold text-white">Flow</div>
                <div className="bg-white/10 rounded-lg px-4 py-2 text-xs font-semibold text-white">WebPay</div>
                <div className="bg-white/10 rounded-lg px-4 py-2 text-xs font-semibold text-white">D&eacute;bito</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-xs text-gray-500">
            <span>Hecho con </span><Heart className="h-3 w-3 text-[#d81b60] fill-[#d81b60] inline" /><span> en Renaico &mdash; &copy; 2026 DondeMorales</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
