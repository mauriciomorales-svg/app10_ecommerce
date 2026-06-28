'use client';

import { useCart } from '../context/CartContext';
import { cartLineId } from '../lib/cartLineId';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense, useState } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { formatCLP, toCLP } from '../lib/money';
import CartCrossSell from '../components/CartCrossSell';
import CouponInput, { type AppliedCoupon } from '../components/CouponInput';
import OrderThresholdBar from '../components/OrderThresholdBar';
import StorePageHeader from '../components/StorePageHeader';
import { useCheckoutThresholds } from '../hooks/useCheckoutThresholds';
import StickyMobileCartBar from '../components/StickyMobileCartBar';
import CheckoutTrustStrip from '../components/CheckoutTrustStrip';
import { isBundleCartLine } from '../lib/cartHelpers';
import CartPackContents from '../components/CartPackContents';
import { resolveCartLineIncludes } from '../lib/packIncludes';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { thresholds } = useCheckoutThresholds(total);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-surface">
        <Suspense>
          <StorePageHeader backHref="/#catalogo" backLabel="Catálogo" title="Tu carrito" />
        </Suspense>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <ShoppingCart className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-4 text-brand-ink">Tu Carrito</h1>
          <p className="text-gray-500 mb-6">Aún no tienes productos en el carrito</p>
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            <Link href="/packs" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover transition-colors shadow-lg shadow-brand-primary/20 font-semibold">
              Reservar un pack
            </Link>
            <Link href="/helados" className="inline-flex items-center gap-2 px-6 py-3 border border-brand-primary/30 bg-white text-brand-primary rounded-xl font-semibold hover:bg-emerald-50">
              Ver helados
            </Link>
            <Link href="/#catalogo" className="text-sm font-semibold text-brand-muted hover:text-brand-primary">
              Ir al catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface pb-8">
      <Suspense>
        <StorePageHeader backHref="/#catalogo" backLabel="Catálogo" title={`Carrito (${items.length})`} />
      </Suspense>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const lineId = cartLineId(item);
              return (
              <div key={lineId} className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 flex gap-4 hover:shadow-card-hover transition-shadow">
                <Link
                  href={`/producto/${item.idproducto}`}
                  className="w-24 h-24 bg-slate-100 rounded-xl flex-shrink-0 relative overflow-hidden"
                >
                  {item.imagen ? (
                    <Image
                      src={item.imagen}
                      alt={item.nombre}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/producto/${item.idproducto}`}
                    className="font-semibold text-brand-ink hover:text-brand-primary line-clamp-2"
                  >
                    {item.nombre}
                  </Link>
                  <CartPackContents item={item} />
                  {!resolveCartLineIncludes(item).length &&
                    item.bundle_configuration?.modifiers &&
                    Array.isArray(item.bundle_configuration.modifiers) &&
                    item.bundle_configuration.modifiers.length > 0 && (
                    <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                      {item.bundle_configuration.modifiers.map((m, idx) => {
                        const mod = m as { name?: string; price?: unknown };
                        const p = mod.price;
                        return (
                          <li key={idx} className="flex justify-between gap-2">
                            <span className="truncate">+ {mod.name || 'Opción'}</span>
                            <span className="text-gray-500 shrink-0">
                              {formatCLP(p) === '0' ? 'incluido' : `+$${formatCLP(p)}`}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {item.bundle_configuration?.customization &&
                    Object.keys(item.bundle_configuration.customization as object).length > 0 && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {Object.entries(item.bundle_configuration.customization as Record<string, string>)
                        .filter(([, v]) => v && String(v).trim())
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )}
                  <p className="text-brand-primary font-bold mt-1">${formatCLP(item.precio_venta)}</p>
                  {!isBundleCartLine(item) && item.stock < 999 && (
                    <p className="text-sm text-gray-500">Stock disponible: {item.stock}</p>
                  )}
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(lineId, item.cantidad - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                        disabled={item.cantidad <= 1}
                        aria-label="Disminuir cantidad"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-medium">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(lineId, item.cantidad + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                        disabled={item.cantidad >= item.stock}
                        aria-label="Aumentar cantidad"
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(lineId)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${formatCLP(toCLP(item.precio_venta) * item.cantidad)}
                  </p>
                </div>
              </div>
            );
            })}

            <CartCrossSell cartProductIds={items.map((i) => i.idproducto)} />

            <CouponInput
              subtotal={total}
              applied={coupon}
              onApply={setCoupon}
              hint="Se aplica en checkout. MORALESWEB10, BIENVENIDO10 o RENAICO2000 según tu pedido."
            />
            
            <button
              onClick={clearCart}
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-600 text-sm transition-colors"
            >
              <Trash2 className="h-3 w-3" /> Vaciar carrito
            </button>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 sticky top-24">
              <h2 className="text-lg font-bold mb-4 text-brand-ink">Resumen</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal productos</span>
                  <span className="font-medium">${formatCLP(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Empaque en checkout</span>
                  <span>desde +$290</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entrega</span>
                  <span className="text-brand-success font-medium">Retiro en tienda</span>
                </div>
                <OrderThresholdBar
                  subtotal={total}
                  freeReinforcedFrom={10000}
                  freeGiftBoxFrom={25000}
                  compact
                />
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-brand-primary">${formatCLP(total)}</span>
                </div>
              </div>
              
              <Link
                href={coupon ? `/checkout?coupon=${encodeURIComponent(coupon.codigo)}` : '/checkout'}
                className="block w-full text-center px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover transition-all shadow-lg shadow-brand-primary/20"
              >
                Continuar al pago
              </Link>
              
              <CheckoutTrustStrip
                hasPackReserva={items.some((i) => isBundleCartLine(i))}
              />

              <Link
                href="/#catalogo"
                className="block w-full text-center mt-3 text-brand-primary hover:text-brand-primary-hover text-sm font-medium transition-colors"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
      <StickyMobileCartBar />
    </div>
  );
}


