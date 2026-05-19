'use client';

import { useCart } from '../context/CartContext';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Lock, ArrowLeft, MapPin, ShoppingCart } from 'lucide-react';
import { formatCLP, toCLP } from '../lib/money';
import PackagingSelector from '../components/PackagingSelector';
import DeliverySelector, { type DeliverySelection } from '../components/DeliverySelector';
import type { CheckoutOptionsResponse, FulfillmentType, PackagingOption } from '../lib/checkout';

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

export default function CheckoutPage() {
  const { items, total: cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'flow' | 'mp'>('flow');
  const [paymentProviders, setPaymentProviders] = useState<PaymentProviders>(null);
  const [restaurantCategoryId, setRestaurantCategoryId] = useState<number | null>(null);
  const [packagingKey, setPackagingKey] = useState('standard');
  const [packagingOptions, setPackagingOptions] = useState<PackagingOption[]>([]);
  const [pickupMeta, setPickupMeta] = useState({ address: '', hours: '', whatsapp: '' });
  const [amountToFreeReinforced, setAmountToFreeReinforced] = useState(0);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('pickup');
  const [delivery, setDelivery] = useState<DeliverySelection | null>(null);

  const availableDays = getNextDays(7);
  const [cliente, setCliente] = useState<ClienteData>({
    nombre: '',
    email: '',
    telefono: '+569',
    fecha_retiro: availableDays[0]?.value || '',
  });

  const subtotalProductos = cartTotal;

  const selectedPackaging = useMemo(
    () => packagingOptions.find((o) => o.key === packagingKey),
    [packagingOptions, packagingKey],
  );

  const packagingAmount = selectedPackaging?.amount ?? 0;
  const deliveryAmount = fulfillmentType === 'delivery' && delivery ? delivery.amount : 0;
  const storeTotal = subtotalProductos + packagingAmount;

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
          setPickupMeta(data.pickup);
          setAmountToFreeReinforced(
            Math.max(0, (data.thresholds?.free_reinforced_from ?? 10000) - subtotalProductos),
          );
          const rec = data.packaging_options.find((o) => o.recommended);
          if (rec) setPackagingKey(rec.key);
        }
      } catch {
        /* noop */
      }
    };
    load();
  }, [subtotalProductos]);

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0fdf4] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShoppingCart className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-[#1a1a2e]">Checkout</h1>
          <p className="text-gray-500 mb-6">Tu carrito esta vacio</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#16a34a] text-white rounded-xl">
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fulfillmentType === 'delivery' && (!delivery || delivery.amount <= 0)) {
      alert('Calcula el costo de envío antes de pagar.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = metodoPago === 'flow' ? '/api/pagos/flow' : '/api/pagos/mp-online';
      const body: Record<string, unknown> = {
        items,
        cliente,
        packaging_key: packagingKey,
        fulfillment_type: fulfillmentType,
        total: storeTotal,
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
        alert(data.message || data.errors?.total?.[0] || 'Error al crear el pago');
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
      alert('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/cart" className="inline-flex items-center gap-1 text-[#16a34a] text-sm font-medium mb-4">
          <ArrowLeft className="h-4 w-4" /> Volver al carrito
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-[#1a1a2e] flex items-center gap-2">
          <Lock className="h-6 w-6 text-[#16a34a]" /> Finalizar compra
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DeliverySelector
              fulfillmentType={fulfillmentType}
              onFulfillmentChange={setFulfillmentType}
              value={delivery}
              onChange={setDelivery}
              pickupAddress={pickupMeta.address}
            />

            {packagingOptions.length > 0 && (
              <PackagingSelector
                options={packagingOptions}
                selected={packagingKey}
                onSelect={setPackagingKey}
                amountToFreeReinforced={amountToFreeReinforced}
              />
            )}

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100">
              <h2 className="text-lg font-semibold mb-4 text-[#1a1a2e] flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#16a34a]" />
                {fulfillmentType === 'delivery' ? 'Tus datos' : 'Retiro en tienda'}
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={cliente.nombre}
                    onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-emerald-100 rounded-xl"
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
                      className="w-full px-4 py-2 border border-emerald-100 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                    <input
                      type="tel"
                      required
                      value={cliente.telefono}
                      onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                      className="w-full px-4 py-2 border border-emerald-100 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {fulfillmentType === 'delivery' ? 'Fecha preferida de entrega' : 'Fecha de retiro *'}
                  </label>
                  <select
                    required={fulfillmentType === 'pickup'}
                    value={cliente.fecha_retiro}
                    onChange={(e) => setCliente({ ...cliente, fecha_retiro: e.target.value })}
                    className="w-full px-4 py-2 border border-emerald-100 rounded-xl"
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
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (fulfillmentType === 'delivery' && !delivery)}
              className="w-full py-4 bg-[#16a34a] text-white font-bold rounded-xl disabled:opacity-50"
            >
              {loading ? 'Procesando...' : `Pagar productos $${formatCLP(storeTotal)}`}
            </button>
          </form>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 h-fit space-y-3">
            <h2 className="text-lg font-semibold text-[#1a1a2e]">Resumen</h2>
            {items.map((item) => (
              <div key={item.idproducto} className="flex justify-between text-sm">
                <span className="truncate pr-2">
                  {item.nombre} x{item.cantidad}
                </span>
                <span>${formatCLP(toCLP(item.precio_venta) * item.cantidad)}</span>
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
              <div className="flex justify-between font-bold text-lg text-[#16a34a] pt-2">
                <span>Total a pagar aquí</span>
                <span>${formatCLP(storeTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
