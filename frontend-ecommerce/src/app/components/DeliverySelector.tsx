'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, MapPin, Navigation, Store, Truck } from 'lucide-react';
import type { DeliveryConfig, DeliveryQuote, FulfillmentType } from '../lib/checkout';
import { formatCLP } from '../lib/money';

export type DeliverySelection = {
  address: string;
  lat: number;
  lng: number;
  amount: number;
  quote: DeliveryQuote | null;
};

interface DeliverySelectorProps {
  fulfillmentType: FulfillmentType;
  onFulfillmentChange: (type: FulfillmentType) => void;
  value: DeliverySelection | null;
  onChange: (value: DeliverySelection | null) => void;
  pickupAddress: string;
  /** Si el carrito es solo packs regalo, el envío es $0 */
  productIds?: number[];
  regaloPackFreeDelivery?: boolean;
  /** Subtotal productos — para aviso pedido mínimo recomendado */
  cartSubtotal?: number;
}

type RenaicoDeliveryMsg = {
  min_pedido_delivery_clp?: number;
  min_pedido_delivery_nota?: string;
  ventanas?: { nombre: string; horario: string; dias: string }[];
};

export default function DeliverySelector({
  fulfillmentType,
  onFulfillmentChange,
  value,
  onChange,
  pickupAddress,
  productIds = [],
  regaloPackFreeDelivery = false,
  cartSubtotal = 0,
}: DeliverySelectorProps) {
  const [config, setConfig] = useState<DeliveryConfig | null>(null);
  const [renaico, setRenaico] = useState<RenaicoDeliveryMsg | null>(null);
  const [addressInput, setAddressInput] = useState(value?.address ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/checkout/delivery-config')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setConfig(d);
          setRenaico(d.renaico ?? null);
        }
      })
      .catch(() => {});
  }, []);

  const applyQuote = useCallback(
    (lat: number, lng: number, address: string, quote: DeliveryQuote) => {
      if (!quote.within_radius) {
        setError('Esa ubicación está fuera de nuestro radio de envío.');
        onChange(null);
        return;
      }
      setError('');
      onChange({
        address,
        lat,
        lng,
        amount: quote.amount,
        quote,
      });
    },
    [onChange],
  );

  const fetchQuote = useCallback(
    async (lat: number, lng: number, address: string) => {
      setLoading(true);
      setError('');
      try {
        const ids = productIds.filter((id) => id > 0).join(',');
        const res = await fetch(
          `/api/checkout/delivery-quote?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}${ids ? `&product_ids=${encodeURIComponent(ids)}` : ''}`,
        );
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data.message || 'No podemos enviar a esa dirección.');
          onChange(null);
          return;
        }
        applyQuote(lat, lng, address, data.quote as DeliveryQuote);
      } catch {
        setError('Error al calcular el envío.');
        onChange(null);
      } finally {
        setLoading(false);
      }
    },
    [applyQuote, onChange, productIds],
  );

  const geocodeAddress = async () => {
    const addr = addressInput.trim();
    if (addr.length < 5) {
      setError('Escribe calle, número y referencia.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: addr,
          product_ids: productIds.filter((id) => id > 0),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Dirección no encontrada.');
        onChange(null);
        return;
      }
      const loc = data.location;
      const display = loc.display_name || addr;
      setAddressInput(display);
      applyQuote(loc.lat, loc.lng, display, data.quote as DeliveryQuote);
    } catch {
      setError('Error al buscar la dirección.');
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no permite ubicación.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const label = `Ubicación GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setAddressInput(label);
        fetchQuote(lat, lng, label);
      },
      () => {
        setError('No pudimos obtener tu ubicación. Permite GPS o escribe la dirección.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 space-y-4">
      <h2 className="text-lg font-semibold text-brand-ink flex items-center gap-2">
        <Truck className="h-5 w-5 text-brand-primary" /> ¿Cómo recibes tu pedido?
      </h2>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            onFulfillmentChange('pickup');
            onChange(null);
            setError('');
          }}
          className={`p-3 rounded-xl border-2 text-left transition-colors ${
            fulfillmentType === 'pickup'
              ? 'border-brand-primary bg-emerald-50'
              : 'border-gray-200 hover:border-emerald-200'
          }`}
        >
          <Store className="h-5 w-5 text-brand-primary mb-1" />
          <p className="font-semibold text-sm">Retiro en tienda</p>
          <p className="text-[10px] text-gray-500">Sin costo de envío</p>
        </button>
        <button
          type="button"
          onClick={() => onFulfillmentChange('delivery')}
          className={`p-3 rounded-xl border-2 text-left transition-colors ${
            fulfillmentType === 'delivery'
              ? 'border-brand-primary bg-emerald-50'
              : 'border-gray-200 hover:border-emerald-200'
          }`}
        >
          <Truck className="h-5 w-5 text-brand-primary mb-1" />
          <p className="font-semibold text-sm">Envío a domicilio</p>
          <p className="text-[10px] text-gray-500">
            {regaloPackFreeDelivery
              ? 'Gratis con tu pack regalo'
              : (config?.pricing.hint ?? 'Desde $2.000 en comuna')}
          </p>
        </button>
      </div>

      {fulfillmentType === 'pickup' && (
        <p className="text-xs text-gray-500 flex items-start gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-brand-primary" />
          Retiras en {pickupAddress || 'Santiago Watt 205, Renaico'} con tu código tras pagar.
        </p>
      )}

      {fulfillmentType === 'delivery' && (
        <div className="space-y-3 border-t border-gray-100 pt-3">
          {renaico?.ventanas && renaico.ventanas.length > 0 && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-xs text-gray-600">
              <p className="font-semibold text-brand-ink mb-1">Ventanas de entrega (Renaico)</p>
              <ul className="space-y-1">
                {renaico.ventanas.map((v) => (
                  <li key={v.nombre}>
                    <strong>{v.nombre}</strong> {v.horario} · {v.dias}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] text-gray-500">
                Te confirmamos la hora exacta por WhatsApp tras pagar.
              </p>
            </div>
          )}

          {!regaloPackFreeDelivery &&
            (renaico?.min_pedido_delivery_clp ?? 0) > 0 &&
            cartSubtotal > 0 &&
            cartSubtotal < (renaico?.min_pedido_delivery_clp ?? 0) && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                Para envío recomendamos pedidos desde{' '}
                <strong>${formatCLP(renaico?.min_pedido_delivery_clp ?? 0)}</strong>.
                {renaico?.min_pedido_delivery_nota ? ` ${renaico.min_pedido_delivery_nota}` : null}
              </p>
            )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección de entrega *
            </label>
            <textarea
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              rows={2}
              placeholder="Ej: Los Notros 123, Villa …, Renaico"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={geocodeAddress}
              disabled={loading}
              className="flex-1 min-w-[140px] py-2 bg-brand-primary text-white text-sm font-semibold rounded-lg disabled:opacity-50"
            >
              Calcular envío
            </button>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={loading}
              className="flex items-center justify-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium"
            >
              <Navigation className="h-4 w-4" /> GPS
            </button>
          </div>

          {loading && (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Calculando…
            </p>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {regaloPackFreeDelivery && fulfillmentType === 'delivery' && !value && (
            <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
              Tu pack regalo incluye <strong>envío gratis</strong> en Renaico. Calcula la dirección para confirmar cobertura.
            </p>
          )}

          {value?.quote && value.amount === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm">
              <p className="font-bold text-brand-primary">Envío incluido — $0</p>
              <p className="text-gray-600 text-xs mt-1">
                Pack regalo · ~{value.quote.distance_km_adjusted} km desde Watt 205
              </p>
            </div>
          )}

          {value?.quote && value.amount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm">
              <p className="font-bold text-brand-primary">
                Envío: ${formatCLP(value.amount)}
              </p>
              <p className="text-gray-600 text-xs mt-1">
                ~{value.quote.distance_km_adjusted} km desde la tienda ·{' '}
                {value.quote.breakdown.label}
              </p>
              <p className="text-gray-500 text-[10px] mt-2">
                Referencia para JobsHours. Pagas el envío allí (no en este checkout de la tienda).
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
