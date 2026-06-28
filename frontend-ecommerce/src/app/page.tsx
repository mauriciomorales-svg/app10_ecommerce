import { Suspense } from 'react';
import { Flame, Gift, IceCream, MapPin, Package, Sparkles, Tag } from 'lucide-react';
import CartButton from './components/CartButton';
import SearchBar from './components/SearchBar';
import ProductGrid from './components/ProductGrid';
import CategorySidebar from './components/CategorySidebar';
import FeaturedProductsRow from './components/FeaturedProductsRow';
import MobileCategoryStrip from './components/MobileCategoryStrip';
import ProductFilterChips from './components/ProductFilterChips';
import StickyMobileCartBar from './components/StickyMobileCartBar';
import Logo from './components/Logo';
import HomeSplitHero from './components/HomeSplitHero';
import HomePromoBar from './components/HomePromoBar';
import HomeWeeklyOfferBanner from './components/HomeWeeklyOfferBanner';
import HomeHowItWorks from './components/HomeHowItWorks';
import HomeDeliverySection from './components/HomeDeliverySection';
import QuickCategoryNav from './components/QuickCategoryNav';
import TrustBlock from './components/TrustBlock';
import ExperienceMobileNav from './components/ExperienceMobileNav';
import DiaPadreBanner from './components/DiaPadreBanner';
import HeladosCombosSection from './components/HeladosCombosSection';
import PacksPremiumShowcase from './components/PacksPremiumShowcase';
import HomeRegalosTeaser from './components/HomeRegalosTeaser';
import SaladaDestacadosSection from './components/SaladaDestacadosSection';
import Link from 'next/link';
import { PICKUP_LINE } from './lib/brandCopy';

function isStoreOpen(): boolean {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 9 && hour < 21;
}

export default function Home() {
  const abierto = isStoreOpen();

  return (
    <div className="home-page-bg min-h-screen pb-24 md:pb-8">
      {/* Top bar */}
      <div className="premium-topbar py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4">
          <span className="flex items-center gap-1.5 truncate text-[11px]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-accent" />
            <span className="text-emerald-100/95">Santiago Watt 205, Renaico</span>
          </span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${
              abierto
                ? 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/25'
                : 'bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/25'
            }`}
          >
            {abierto ? '● Abierto ahora' : '● Cerrado · Abre 9:00'}
          </span>
          <span className="hidden items-center gap-1 sm:inline shrink-0 text-emerald-200/70">
            <Sparkles className="h-3 w-3 text-brand-accent/80" />
            Retiro Santiago Watt 205, Renaico · Reparto Renaico · Packs y combos a pedido
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="premium-glass-header">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Logo compact />

            <div className="min-w-0 flex-1">
              <Suspense fallback={<div className="h-11 animate-pulse rounded-2xl bg-slate-100/80" />}>
                <SearchBar variant="compact" scope="home" />
              </Suspense>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                href="/packs"
                className="premium-nav-chip border-brand-primary/30 bg-gradient-to-b from-white to-emerald-50/80 text-brand-primary shadow-sm hover:border-brand-primary"
              >
                <Package className="h-3.5 w-3.5" />
                Packs
              </Link>
              <Link
                href="/helados"
                className="premium-nav-chip border-teal-200/80 bg-gradient-to-b from-white to-teal-50/80 text-teal-900 shadow-sm hover:border-teal-400"
              >
                <IceCream className="h-3.5 w-3.5" />
                Helados
              </Link>
              <Link
                href="/regalos"
                className="premium-nav-chip border-rose-200/80 bg-gradient-to-b from-white to-rose-50/80 text-rose-950 shadow-sm hover:border-rose-400"
              >
                <Gift className="h-3.5 w-3.5" />
                Regalos
              </Link>
              <Link
                href="/salada"
                className="premium-nav-chip border-amber-200/80 bg-gradient-to-b from-white to-orange-50/80 text-orange-950 shadow-sm hover:border-amber-400"
              >
                <Flame className="h-3.5 w-3.5" />
                Comida
              </Link>
              <Link
                href="/?orden=precio_menor#catalogo"
                className="premium-nav-chip border-amber-300/50 bg-gradient-to-b from-white to-amber-50/60 text-brand-ink shadow-sm hover:border-brand-accent"
              >
                <Tag className="h-3.5 w-3.5 text-brand-accent" />
                Ofertas
              </Link>
              <Suspense>
                <CartButton />
              </Suspense>
            </div>
          </div>
        </div>
      </header>

      <ExperienceMobileNav />
      <DiaPadreBanner />

      <main className="home-main-flow">
        <HomeSplitHero />
        <HomeDeliverySection />
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <PacksPremiumShowcase variant="home" />
          <HomeRegalosTeaser />
          <SaladaDestacadosSection variant="home" />
          <HeladosCombosSection variant="home" />
        </div>
        <HomeWeeklyOfferBanner />
        <HomePromoBar />
        <QuickCategoryNav />
        <HomeHowItWorks />

        <Suspense fallback={null}>
          <FeaturedProductsRow />
        </Suspense>

        <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-24 px-3 py-4 sm:px-4">
          <div className="premium-section-head mb-4">
            <span className="premium-kicker">Minimarket completo</span>
            <h2 className="premium-heading">Catálogo DondeMorales</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Minimarket DondeMorales · retiro {PICKUP_LINE}
            </p>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <aside className="hidden shrink-0 lg:block lg:w-60">
              <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-white/60 shadow-premium" />}>
                <CategorySidebar />
              </Suspense>
            </aside>

            <div className="min-w-0 flex-1">
              <Suspense fallback={null}>
                <MobileCategoryStrip />
              </Suspense>
              <Suspense fallback={null}>
                <ProductFilterChips />
              </Suspense>
              <div className="premium-catalog-shell mt-4">
                <Suspense
                  fallback={
                    <div className="flex justify-center py-16">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                    </div>
                  }
                >
                  <ProductGrid />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        <TrustBlock />
      </main>

      <footer className="premium-footer">
        <div className="relative z-10">
          <Link href="/" className="mb-4 inline-flex items-center justify-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent/90 font-display text-base font-extrabold text-brand-ink shadow-lg shadow-black/20">
              DM
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Donde<span className="text-brand-accent">Morales</span>
            </span>
          </Link>
          <p className="text-sm text-emerald-100/90">
            © {new Date().getFullYear()} DondeMorales — Santiago Watt 205, Renaico
          </p>
          <p className="mt-1 text-[11px] text-emerald-200/50">Araucanía, Chile · Tu minimarket de confianza</p>
          <p className="mt-3 flex flex-wrap justify-center gap-3 text-[11px]">
            <Link href="/envios" className="font-semibold text-emerald-200/90 hover:text-white">
              Envíos y FAQ
            </Link>
            <a
              href="https://wa.me/56975647756"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-200/90 hover:text-white"
            >
              WhatsApp
            </a>
          </p>
        </div>
      </footer>

      <StickyMobileCartBar />
    </div>
  );
}
