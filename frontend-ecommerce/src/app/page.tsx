import Link from 'next/link';
import { Suspense } from 'react';
import {
  MapPin,
  Store,
  Tag,
  MessageCircle,
  Clock,
  Truck,
} from 'lucide-react';
import CartButton from './components/CartButton';
import SearchBar from './components/SearchBar';
import ProductGrid from './components/ProductGrid';
import CategorySidebar from './components/CategorySidebar';
import FeaturedProductsRow from './components/FeaturedProductsRow';
import MobileCategoryStrip from './components/MobileCategoryStrip';
import ProductFilterChips from './components/ProductFilterChips';
import StickyMobileCartBar from './components/StickyMobileCartBar';

const QUICK_CATEGORIES = [
  { emoji: '🥤', name: 'Bebidas', query: 'bebida' },
  { emoji: '🍿', name: 'Snacks', query: 'snack' },
  { emoji: '🧴', name: 'Limpieza', query: 'limpieza' },
  { emoji: '🥛', name: 'Lácteos', query: 'leche' },
  { emoji: '🍞', name: 'Pan', query: 'pan' },
  { emoji: '🛒', name: 'Abarrotes', query: 'arroz' },
];

function isStoreOpen(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 9 && hour < 21;
}

export default function Home() {
  const abierto = isStoreOpen();

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24 md:pb-0">
      {/* Ticker */}
      <div className="bg-[#166534] text-emerald-100 text-[11px] py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center gap-2">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" /> Watt 205, Renaico
          </span>
          <span className={`shrink-0 font-semibold ${abierto ? 'text-lime-300' : 'text-amber-200'}`}>
            {abierto ? '● Abierto ahora' : '● Cerrado · Abre 9:00'}
          </span>
          <span className="hidden sm:inline shrink-0">Retiro en tienda · Pago Flow</span>
        </div>
      </div>

      {/* Header: logo + búsqueda + carrito */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-[#16a34a] rounded-lg flex items-center justify-center">
                <Store className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-extrabold text-[#1a1a2e] leading-none">
                  Donde<span className="text-[#16a34a]">Morales</span>
                </span>
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <Suspense fallback={<div className="h-10 bg-gray-100 rounded-lg animate-pulse" />}>
                <SearchBar variant="compact" />
              </Suspense>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Link
                href="/?orden=precio_menor#catalogo"
                className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg"
              >
                <Tag className="h-3.5 w-3.5" /> Ofertas
              </Link>
              <Suspense>
                <CartButton />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      {/* Pasillos rápidos */}
      <section className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
          {QUICK_CATEGORIES.map((item) => (
            <Link
              key={item.name}
              href={`/?buscar=${encodeURIComponent(item.query)}#catalogo`}
              className="shrink-0 snap-start flex flex-col items-center justify-center w-[72px] h-[72px] bg-white rounded-xl border border-gray-200 hover:border-[#16a34a] transition-colors"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-[10px] font-semibold text-gray-700 mt-0.5">{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Más vendidos — arriba del catálogo para conversión */}
      <Suspense fallback={null}>
        <FeaturedProductsRow />
      </Suspense>

      {/* Catálogo */}
      <section id="catalogo" className="max-w-7xl mx-auto px-3 py-2 scroll-mt-16">
        <div className="flex flex-col lg:flex-row gap-4">
          <aside className="hidden lg:block lg:w-56 shrink-0">
            <Suspense fallback={<div className="bg-white rounded-lg h-80 animate-pulse" />}>
              <CategorySidebar />
            </Suspense>
          </aside>

          <main className="flex-1 min-w-0">
            <Suspense fallback={null}>
              <MobileCategoryStrip />
            </Suspense>
            <Suspense fallback={null}>
              <ProductFilterChips />
            </Suspense>
            <div className="mt-3 bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
              <Suspense
                fallback={
                  <div className="flex justify-center py-16">
                    <div className="h-8 w-8 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              >
                <ProductGrid />
              </Suspense>
            </div>
          </main>
        </div>
      </section>

      {/* Info tienda — abajo para no bloquear compra */}
      <section className="max-w-7xl mx-auto px-3 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex gap-3">
            <Truck className="h-5 w-5 text-[#16a34a] shrink-0" />
            <div>
              <p className="font-bold text-[#1a1a2e]">Retiro en tienda</p>
              <p className="text-gray-500 text-xs">Paga online y retira con tu código</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex gap-3">
            <Clock className="h-5 w-5 text-[#16a34a] shrink-0" />
            <div>
              <p className="font-bold text-[#1a1a2e]">Horario</p>
              <p className="text-gray-500 text-xs">Lun–Dom 9:00 a 21:00</p>
            </div>
          </div>
          <a
            href="https://wa.me/56976647756"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25d366] rounded-lg p-4 flex gap-3 text-white hover:bg-[#1da851] transition-colors"
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">WhatsApp</p>
              <p className="text-emerald-100 text-xs">+56 9 7664 7756</p>
            </div>
          </a>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} DondeMorales — Minimarket Renaico · Santiago Watt 205
      </footer>

      <StickyMobileCartBar />
    </div>
  );
}
