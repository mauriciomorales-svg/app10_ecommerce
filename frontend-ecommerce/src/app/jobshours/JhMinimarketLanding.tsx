'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { BarChart3, MessageCircle, Plug, ScanLine, Users } from 'lucide-react';
import CartButton from '../components/CartButton';
import { useCart } from '../context/CartContext';
import { formatCLP } from '../lib/money';
import { JhStickyCta } from './JhStickyCta';
import { FLYERS, PRECIOS, WA_RETAIL_LINK } from './jh-data';
import { useJobshoursProducts } from './useJobshoursProducts';

const BENEFITS = [
  { title: 'Lector USB', sub: 'Conectas y listo', icon: Plug },
  { title: 'Inventario al día', sub: 'Aviso si falta producto', icon: BarChart3 },
  { title: 'Varios cajeros', sub: 'Roles por usuario', icon: Users },
] as const;

export default function JhMinimarketLanding() {
  const { addToCart } = useCart();
  const { bySku } = useJobshoursProducts();
  const planRetail = bySku.get('JH-04');

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-sm font-bold text-[var(--jh-muted)] hover:text-[#2563eb]">
            ← JobsHours
          </Link>
          <span className="hidden font-semibold text-[var(--jh-ink)] md:inline">Minimarket y almacén</span>
          <Suspense>
            <CartButton />
          </Suspense>
        </div>
      </header>

      <main className="pb-24 md:pb-10">
        <section className="border-b border-slate-100 bg-white px-4 py-10 md:py-14">
          <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <span className="jh-badge jh-badge-blue">Caja minimarket</span>
              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-[var(--jh-ink)] sm:text-4xl">
                Barra, lector e{' '}
                <span className="text-[#2563eb]">inventario bajo control.</span>
              </h1>
              <p className="mt-4 text-base text-[var(--jh-muted)]">
                Para almacén, ferretería o minimarket. Escaneas el código, el inventario se actualiza solo y te avisa
                cuando algo se acaba. No es tablet de pedidos de comida — es caja clásica.
              </p>
              <p className="mt-4 font-display text-xl font-bold text-[#2563eb]">
                {formatCLP(PRECIOS.planRetail)}
                <span className="text-sm font-semibold text-[var(--jh-muted)]">/mes + IVA</span>
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <a href={WA_RETAIL_LINK} target="_blank" rel="noopener noreferrer" className="jh-btn-primary">
                  <MessageCircle className="h-4 w-4" />
                  Consultar por WhatsApp
                </a>
                {planRetail && (
                  <button
                    type="button"
                    onClick={() =>
                      addToCart({
                        idproducto: planRetail.idproducto,
                        nombre: planRetail.nombre,
                        precio_venta: planRetail.precio_venta ?? PRECIOS.planRetail,
                        imagen: planRetail.imagen_url || null,
                        stock: 99,
                        idcategoria: planRetail.categorias?.[0]?.idcategoria ?? null,
                      })
                    }
                    className="jh-btn-secondary"
                  >
                    Contratar caja · {formatCLP(PRECIOS.planRetail)}/mes
                  </button>
                )}
              </div>
              <p className="mt-4 text-xs text-[var(--jh-muted)]">
                ¿Vendes comida con fila?{' '}
                <Link href="/comida" className="font-bold text-[var(--jh-green-dark)] hover:underline">
                  Ver tablet de pedidos →
                </Link>
              </p>
            </div>
            <div className="jh-dashed-frame-blue overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg">
              <Image
                src={FLYERS.retail}
                alt="Caja minimarket JobsHours"
                width={800}
                height={1000}
                className="h-auto w-full rounded-xl"
                priority
              />
            </div>
          </div>
        </section>

        <section className="bg-[var(--jh-blue-soft)] px-4 py-10">
          <div className="mx-auto max-w-4xl">
            <h2 className="jh-section-title text-center">Qué resuelve en tu local</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {BENEFITS.map(({ title, sub, icon: Icon }) => (
                <div key={title} className="jh-card text-center">
                  <Icon className="mx-auto h-8 w-8 text-[#2563eb]" />
                  <p className="mt-2 font-bold text-sm">{title}</p>
                  <p className="text-xs text-[var(--jh-muted)]">{sub}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-[var(--jh-muted)]">
              Tú compras PC o tablet y lector USB · JobsHours configura caja, inventario y Mercado Pago
            </p>
          </div>
        </section>

        <section className="px-4 py-10 text-center">
          <ScanLine className="mx-auto h-10 w-10 text-[#2563eb]" />
          <h2 className="mt-4 font-display text-xl font-bold">Instalación y planes detallados</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--jh-muted)]">
            Comparativa de soporte, instalación remota o en local, y extras en el catálogo completo.
          </p>
          <Link href="/catalogo#retail" className="jh-btn-secondary mt-6 inline-flex">
            Ver precios de caja →
          </Link>
        </section>
      </main>

      <JhStickyCta
        primary={{ kind: 'link', href: WA_RETAIL_LINK, label: 'Consultar minimarket', icon: 'whatsapp' }}
      />
    </>
  );
}
