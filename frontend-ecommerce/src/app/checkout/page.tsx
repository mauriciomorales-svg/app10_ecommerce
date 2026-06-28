'use client';

import { useCart } from '../context/CartContext';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, MapPin, ShoppingCart, ShieldCheck } from 'lucide-react';
import StorePageHeader from '../components/StorePageHeader';
import { formatCLP, toCLP } from '../lib/money';
import PackagingSelector from '../components/PackagingSelector';
import DeliverySelector, { type DeliverySelection } from '../components/DeliverySelector';
import CouponInput, { type AppliedCoupon, revalidateCoupon } from '../components/CouponInput';
import OrderThresholdBar from '../components/OrderThresholdBar';
import CartCrossSell from '../components/CartCrossSell';
import { useCommerceStore } from '../context/CommerceStoreContext';
import { useCheckoutPreview } from '../hooks/useCheckoutPreview';
import { useCheckoutThresholds } from '../hooks/useCheckoutThresholds';
import type { CheckoutOptionsResponse, FulfillmentType, PackagingOption } from '../lib/checkout';
import { trackMeta } from '../lib/analytics';
import { getMarketingAttributionPayload } from '../lib/marketingAttribution';
import CheckoutTrustStrip from '../components/CheckoutTrustStrip';
import CartPackContents from '../components/CartPackContents';
import RegaloCheckoutUpsell from '../components/RegaloCheckoutUpsell';
import { cartLineId } from '../lib/cartLineId';

interface ClienteData {
  nombre: string;
  email: string;
  telefono: string;
  fecha_retiro: string;
}

function getNextDays(count: number) {
  const days = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const label = d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    const value = d.toISOString().split('T')[0];
    days.push({ label, value });
  }
  return days;
}

type PaymentProviders = {
  flow: { enabled: boolean; configured: boolean };
  mp_online: { enabled: boolean; configured: boolean };
} | null;

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const { items, total: cartTotal, hydrated } = useCart();
  const { isJobshours } = useCommerceStore();
  const couponFromUrl = searchParams.get('coupon')?.trim().toUpperCase() ?? '';
  const [loading, setLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'flow' | 'mp'>('flow');
  const [paymentProviders, setPaymentProviders] = useState<PaymentProviders>(null);
  const [restaurantCategoryId, setRestaurantCategoryId] = useState<number | null>(null);
  const [packagingKey, setPackagingKey] = useState('standard');
  const [packagingOptions, setPackagingOptions] = useState<PackagingOption[]>([]);
  const [pickupMeta, setPickupMeta] = useState({ address: '', hours: '', whatsapp: '', label: '', hint: '' });
  const [amountToFreeReinforced, setAmountToFreeReinforced] = useState(0);
  const [freeReinforcedFrom, setFreeReinforcedFrom] = useState(10000);
  const [freeGiftBoxFrom, setFreeGiftBoxFrom] = useState(25000);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [formError, setFormError] = useState('');
  const [minOrderProducts, setMinOrderProducts] = useState(0);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup');
  const [delivery, setDelivery] = useState<DeliverySelection | null>(null);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [digitalCheckout, setDigitalCheckout] = useState(false);

  const availableDays = getNextDays(7);
  const [cliente, setCliente] = useState<ClienteData>({
    nombre: '',
    email: '',
    telefono: '+569',
    fecha_retiro: availableDays[0]?.value || '',
  });

  const subtotalProductos = cartTotal;

  const hasPackReserva = useMemo(
    () =>
      items.some(
        (i) =>
          i.bundle_configuration != null ||
          /pack|regalo|arma tu|combo helado/i.test(i.nombre),
      ),
    [items],
  );

  const selectedPackaging = useMemo(
    () => packagingOptions.find((o) => o.key === packagingKey),
    [packagingOptions, packagingKey],
  );

  const { thresholds } = useCheckoutThresholds(subtotalProductos);
  const { totals: previewTotals, syncing: previewSyncing } = useCheckoutPreview({
    items,
    packagingKey,
    fulfillmentType,
    delivery,
    coupon,
    clienteEmail: cliente.email,
    clienteTelefono: cliente.telefono,
  });

  const packagingAmount = previewTotals?.packagingAmount ?? selectedPackaging?.amount ?? 0;
  const deliveryAmount =
    previewTotals?.deliveryAmount ??
    (fulfillmentType === 'delivery' && delivery ? delivery.amount : 0);
  const couponDiscount = previewTotals?.couponDiscount ?? coupon?.discount ?? 0;
  const storeTotal =
    previewTotals?.storeTotal ??
    Math.max(0, subtotalProductos + packagingAmount - couponDiscount);
  const deliveryFreeRegalo = Boolean(previewTotals?.deliveryFreeRegaloPack);
  const deliveryReady =
    fulfillmentType !== 'delivery' ||
    Boolean(delivery && (delivery.amount > 0 || deliveryFreeRegalo));

  useEffect(() => {
    if (items.length === 0) {
      return;
    }
    trackMeta('InitiateCheckout', {
      value: subtotalProductos,
      currency: 'CLP',
      num_items: items.reduce((n, i) => n + (i.cantidad ?? 1), 0),
    });
  }, [items, subtotalProductos]);

  useEffect(() => {
    fetch('/api/productos/categorias')
      .then((r) => r.json())
      .then((cats: { idcategoria?: number; nombre?: string }[]) => {
        const rest = cats.find((c) => {
          const n = String(c?.nombre ?? '').toLowerCase();
          return n === 'restaurant' || n === 'restaurante';
        });
        setRestaurantCategoryId(rest?.idcategoria ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/pagos/providers')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.providers) {
          setPaymentProviders({ flow: data.providers.flow, mp_online: data.providers.mp_online });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/checkout/options?subtotal=${subtotalProductos}`);
        const data: CheckoutOptionsResponse = await res.json();
        if (data.success) {
          setPackagingOptions(data.packaging_options);
          setPickupMeta({
            address: data.pickup.address,
            hours: data.pickup.hours,
            whatsapp: data.pickup.whatsapp,
            label: data.pickup.label ?? '',
            hint: data.pickup.hint ?? '',
          });
          const reinforced = data.thresholds?.free_reinforced_from ?? 10000;
          const gift = data.thresholds?.free_gift_box_from ?? 25000;
          setFreeReinforcedFrom(reinforced);
          setFreeGiftBoxFrom(gift);
          setAmountToFreeReinforced(Math.max(0, reinforced - subtotalProductos));
          setMinOrderProducts(data.min_order_products ?? 0);
          setDeliveryEnabled(data.delivery_enabled !== false);
          setDigitalCheckout(data.fulfillment_mode === 'digital_service');
          if (data.fulfillment_mode === 'digital_service') {
            setMetodoPago('mp');
          }
          const defaultKey =
            data.packaging_default ??
            data.packaging_options.find((o) => o.recommended)?.key ??
            data.packaging_options[0]?.key;
          if (defaultKey) setPackagingKey(defaultKey);
        }
      } catch {
        /* noop */
      }
    };
    load();
  }, [subtotalProductos]);

  useEffect(() => {
    if (!coupon?.codigo) return;
    let cancelled = false;
    revalidateCoupon(coupon, subtotalProductos, cliente.email, cliente.telefono).then((r) => {
      if (cancelled) return;
      if (r.ok) {
        setCoupon(r.coupon);
        setCouponError('');
      } else {
        setCoupon(null);
        setCouponError(r.message);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [subtotalProductos, cliente.email, cliente.telefono, coupon?.codigo]);

  useEffect(() => {
    const code = searchParams.get('coupon')?.trim().toUpperCase();
    if (!code || items.length === 0) return;
    let cancelled = false;
    revalidateCoupon(
      { codigo: code, discount: 0, label: code },
      subtotalProductos,
      cliente.email,
      cliente.telefono,
    ).then((r) => {
      if (cancelled) return;
      if (r.ok) {
        setCoupon(r.coupon);
        setCouponError('');
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al llegar desde carrito con ?coupon=
  }, [searchParams.get('coupon'), items.length]);

  const isRestaurantCart = useMemo(() => {
    if (!restaurantCategoryId) return false;
    return items.some((i) => (i.idcategoria ?? null) === restaurantCategoryId);
  }, [items, restaurantCategoryId]);

  const mpOnlineAvailable = Boolean(
    paymentProviders?.mp_online.enabled && paymentProviders?.mp_online.configured,
  );

  useEffect(() => {
    if (!isRestaurantCart) return;
    if (mpOnlineAvailable) setMetodoPago((prev) => (prev === 'flow' ? 'mp' : prev));
    else setMetodoPago('flow');
  }, [isRestaurantCart, mpOnlineAvailable]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <p className="text-brand-muted text-sm">Cargando carrito…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-surface">
        <Suspense>
          <StorePageHeader backHref="/cart" backLabel="Carrito" title="Checkout" />
        </Suspense>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <ShoppingCart className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <p className="text-brand-muted mb-2">Tu carrito está vacío</p>
          {couponFromUrl && (
            <p className="text-sm text-amber-800 mb-4 max-w-md mx-auto">
              Para usar el cupón <strong>{couponFromUrl}</strong>, agrega un producto elegible y vuelve a pagar.
            </p>
          )}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
            {couponFromUrl ? (
              <Link href="/helados" className="btn-primary inline-flex">
                Ver combos en Helados
              </Link>
            ) : (
              <>
                <Link href="/packs" className="btn-primary inline-flex">
                  Reservar un pack
                </Link>
                <Link href="/helados" className="inline-flex rounded-xl border border-brand-primary/30 px-6 py-3 font-semibold text-brand-primary hover:bg-emerald-50">
                  Ver helados
                </Link>
              </>
            )}
            <Link href="/cart" className="text-sm font-semibold text-brand-muted hover:text-brand-primary">
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stepEntregaDone =
    fulfillmentType === 'pickup' || Boolean(delivery && deliveryReady);
  const stepDatosDone =
    Boolean(cliente.nombre.trim()) &&
    Boolean(cliente.email.trim()) &&
    cliente.telefono.replace(/\D/g, '').length >= 9;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (fulfillmentType === 'delivery' && !deliveryReady) {
      setFormError('Calcula el envío a tu dirección antes de pagar.');
      return;
    }

    const minOrder = minOrderProducts || thresholds.minOrderProducts;
    if (minOrder > 0 && subtotalProductos < minOrder) {
      setFormError(`El pedido mínimo en productos es $${formatCLP(minOrder)}.`);
      return;
    }

    if (couponError) {
      setFormError(couponError);
      return;
    }

    setLoading(true);
    try {
      const endpoint = metodoPago === 'flow' ? '/api/pagos/flow' : '/api/pagos/mp-online';
      const body: Record<string, unknown> = {
        items,
        cliente: digitalCheckout
          ? { ...cliente, fecha_retiro: cliente.fecha_retiro || null }
          : cliente,
        packaging_key: packagingKey,
        fulfillment_type: fulfillmentType,
        total: storeTotal,
        coupon_code: coupon?.codigo ?? undefined,
        marketing: getMarketingAttributionPayload(),
      };

      if (fulfillmentType === 'delivery' && delivery) {
        body.delivery = {
          address: delivery.address,
          lat: delivery.lat,
          lng: delivery.lng,
          amount: delivery.amount,
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data.message || data.errors?.total?.[0] || 'Error al crear el pago');
        return;
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dm_pending_checkout', '1');
      }
      if (metodoPago === 'flow' && data.url && data.token) {
        window.location.href = data.url + '?token=' + data.token;
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setFormError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-10">
      <Suspense>
        <StorePageHeader backHref="/cart" backLabel="Carrito" title="Finalizar compra" />
      </Suspense>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center gap-2 text-xs mb-6">
          <span className={stepEntregaDone ? 'font-bold text-brand-primary' : 'text-brand-muted'}>
            1. Entrega {stepEntregaDone ? '✓' : ''}
          </span>
          <span className="text-brand-muted">→</span>
          <span className={stepDatosDone ? 'font-bold text-brand-primary' : 'text-brand-muted'}>
            2. Datos {stepDatosDone ? '✓' : ''}
          </span>
          <span className="text-brand-muted">→</span>
          <span className="font-bold text-brand-primary">
            3. {hasPackReserva ? 'Reserva y pago' : 'Pago'}
          </span>
        </div>

        {formError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {formError}
          </div>
        )}

        {hasPackReserva && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">
            <strong>Reserva de pack:</strong> preparamos tu pedido antes de la fecha de retiro. Recibirás confirmación
            por email con el detalle de tus elecciones.
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <OrderThresholdBar
              subtotal={subtotalProductos}
              freeReinforcedFrom={freeReinforcedFrom}
              freeGiftBoxFrom={freeGiftBoxFrom}
              minOrderProducts={minOrderProducts || thresholds.minOrderProducts}
            />

            <CouponInput
              subtotal={subtotalProductos}
              applied={coupon}
              onApply={(c) => {
                setCoupon(c);
                setCouponError('');
              }}
              email={cliente.email}
              telefono={cliente.telefono}
              hint="MORALESWEB10: 10% primera compra web (mín. $5.000). BIENVENIDO10 y RENAICO2000 también disponibles."
            />
            {couponError && <p className="text-xs text-red-600 -mt-2">{couponError}</p>}

            {deliveryEnabled && (
            <>
            <DeliverySelector
              fulfillmentType={fulfillmentType}
              onFulfillmentChange={(type) => {
                setFulfillmentType(type);
                if (type === 'pickup') setDelivery(null);
              }}
              value={delivery}
              onChange={setDelivery}
              pickupAddress={pickupMeta.address}
              productIds={items.map((i) => i.idproducto)}
              regaloPackFreeDelivery={Boolean(previewTotals?.deliveryFreeRegaloPack)}
              cartSubtotal={subtotalProductos}
            />
            {fulfillmentType === 'delivery' && !delivery && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                Para envío a domicilio en Renaico y alrededores, escribe tu dirección y pulsa{' '}
                <strong>Calcular envío</strong> antes de pagar.
              </p>
            )}
            </>
            )}

            {!digitalCheckout && packagingOptions.length > 1 && (
              <PackagingSelector
                options={packagingOptions}
                selected={packagingKey}
                onSelect={setPackagingKey}
                amountToFreeReinforced={amountToFreeReinforced}
                amountToFreeGiftBox={Math.max(0, freeGiftBoxFrom - subtotalProductos)}
                freeReinforcedFrom={freeReinforcedFrom}
                freeGiftBoxFrom={freeGiftBoxFrom}
              />
            )}

            <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
              <h2 className="text-lg font-semibold mb-4 text-brand-ink flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-primary" />
                {digitalCheckout
                  ? pickupMeta.label || 'Tus datos de contacto'
                  : fulfillmentType === 'delivery'
                    ? 'Tus datos'
                    : 'Retiro en tienda'}
              </h2>
              {digitalCheckout && pickupMeta.hint && (
                <p className="mb-4 text-sm text-brand-muted">{pickupMeta.hint}</p>
              )}
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={cliente.nombre}
                    onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 outline-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={cliente.email}
                      onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                    <input
                      type="tel"
                      required
                      value={cliente.telefono}
                      onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 outline-none"
                    />
                  </div>
                </div>
                {!digitalCheckout && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fulfillmentType === 'delivery'
                        ? 'Fecha preferida de entrega'
                        : 'Fecha de retiro *'}
                  </label>
                  <select
                    required={fulfillmentType === 'pickup'}
                    value={cliente.fecha_retiro}
                    onChange={(e) => setCliente({ ...cliente, fecha_retiro: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 outline-none"
                  >
                    {availableDays.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                  {fulfillmentType === 'pickup' && (
                    <p className="text-xs text-gray-500 mt-2">
                      {pickupMeta.address || 'Santiago Watt 205, Renaico'} ·{' '}
                      {pickupMeta.hours || 'Lun-Dom 9:00-21:00'}
                      {hasPackReserva && (
                        <>
                          <br />
                          <span className="text-emerald-700">
                            Para packs y regalos, lo armamos con al menos 24 h de anticipación.
                          </span>
                        </>
                      )}
                    </p>
                  )}
                </div>
                )}
              </div>
            </div>

            {paymentProviders?.flow.enabled &&
              paymentProviders?.mp_online.enabled &&
              mpOnlineAvailable && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-brand-ink">Medio de pago</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('flow')}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                      metodoPago === 'flow'
                        ? 'border-brand-primary bg-emerald-50 text-brand-primary'
                        : 'border-slate-200 text-brand-muted hover:border-slate-300'
                    }`}
                  >
                    Flow.cl
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('mp')}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                      metodoPago === 'mp'
                        ? 'border-brand-primary bg-emerald-50 text-brand-primary'
                        : 'border-slate-200 text-brand-muted hover:border-slate-300'
                    }`}
                  >
                    Mercado Pago
                  </button>
                </div>
              </div>
            )}

            <CheckoutTrustStrip hasPackReserva={hasPackReserva} />

            <button
              type="submit"
              disabled={loading || !deliveryReady}
              className="w-full py-4 bg-brand-primary hover:bg-brand-primary-hover text-white font-display font-bold rounded-2xl disabled:opacity-50 shadow-lg shadow-brand-primary/20 transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="h-5 w-5" />
              {loading
                ? 'Procesando...'
                : fulfillmentType === 'delivery' && !deliveryReady
                  ? 'Calcula el envío para continuar'
                  : hasPackReserva
                    ? `Reservar y pagar $${formatCLP(storeTotal)}`
                    : `Pagar productos $${formatCLP(storeTotal)}`}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-brand-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-success" />
              Pago seguro procesado por {metodoPago === 'flow' ? 'Flow.cl' : 'Mercado Pago'}
            </p>
          </form>

          <div className="space-y-4 lg:sticky lg:top-24">
            {hasPackReserva && !isJobshours && !digitalCheckout && (
              <RegaloCheckoutUpsell cartProductIds={items.map((i) => i.idproducto)} />
            )}
            {!isJobshours && !digitalCheckout && (
            <CartCrossSell
              cartProductIds={items.map((i) => i.idproducto)}
              compact
              maxItems={3}
              title="Antes de pagar"
            />
            )}
          <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 h-fit space-y-3">
            <h2 className="text-lg font-semibold text-brand-ink">Resumen</h2>
            {items.map((item) => (
              <div key={cartLineId(item)} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="flex justify-between text-sm gap-2">
                  <span className="min-w-0 flex-1 font-medium text-brand-ink truncate pr-2">
                    {item.nombre} ×{item.cantidad}
                  </span>
                  <span className="shrink-0 tabular-nums">${formatCLP(toCLP(item.precio_venta) * item.cantidad)}</span>
                </div>
                <CartPackContents item={item} compact maxItems={5} />
              </div>
            ))}
            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal productos</span>
                <span>${formatCLP(subtotalProductos)}</span>
              </div>
              <div className="flex justify-between">
                <span>Empaque</span>
                <span>{packagingAmount === 0 ? 'Gratis' : `$${formatCLP(packagingAmount)}`}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-brand-success">
                  <span>Cupón ({coupon?.codigo})</span>
                  <span>-${formatCLP(couponDiscount)}</span>
                </div>
              )}
              {fulfillmentType === 'delivery' && (
                <div className="flex justify-between text-amber-800">
                  <span>Envío (JobsHours)</span>
                  <span className="text-right">
                    {deliveryAmount > 0 ? `~$${formatCLP(deliveryAmount)}` : '—'}
                    <span className="block text-[10px] font-normal text-amber-700">
                      Lo pagas aparte en JobsHours
                    </span>
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg text-brand-primary pt-2">
                <span>Total a pagar aquí</span>
                <span>${formatCLP(storeTotal)}</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-surface" />}>
      <CheckoutPageInner />
    </Suspense>
  );
}
