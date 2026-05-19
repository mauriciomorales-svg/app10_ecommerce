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
}

export default function DeliverySelector({
  fulfillmentType,
  onFulfillmentChange,
  value,
  onChange,
  pickupAddress,
}: DeliverySelectorProps) {
  const [config, setConfig] = useState<DeliveryConfig | null>(null);
  const [addressInput, setAddressInput] = useState(value?.address ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/checkout/delivery-config')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setConfig(d);
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
        const res = await fetch(
          `/api/checkout/delivery-quote?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
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
    [applyQuote, onChange],
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
        body: JSON.stringify({ address: addr }),
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
      <h2 className="text-lg font-semibold text-[#1a1a2e] flex items-center gap-2">
        <Truck className="h-5 w-5 text-[#16a34a]" /> ¿Cómo recibes tu pedido?
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
              ? 'border-[#16a34a] bg-emerald-50'
              : 'border-gray-200 hover:border-emerald-200'
          }`}
        >
          <Store className="h-5 w-5 text-[#16a34a] mb-1" />
          <p className="font-semibold text-sm">Retiro en tienda</p>
          <p className="text-[10px] text-gray-500">Sin costo de envío</p>
        </button>
        <button
          type="button"
          onClick={() => onFulfillmentChange('delivery')}
          className={`p-3 rounded-xl border-2 text-left transition-colors ${
            fulfillmentType === 'delivery'
              ? 'border-[#16a34a] bg-emerald-50'
              : 'border-gray-200 hover:border-emerald-200'
          }`}
        >
          <Truck className="h-5 w-5 text-[#16a34a] mb-1" />
          <p className="font-semibold text-sm">Envío a domicilio</p>
          <p className="text-[10px] text-gray-500">
            {config?.pricing.hint ?? 'Desde $2.000 en comuna'}
          </p>
        </button>
      </div>

      {fulfillmentType === 'pickup' && (
        <p className="text-xs text-gray-500 flex items-start gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#16a34a]" />
          Retiras en {pickupAddress || 'Santiago Watt 205, Renaico'} con tu código tras pagar.
        </p>
      )}

      {fulfillmentType === 'delivery' && (
        <div className="space-y-3 border-t border-gray-100 pt-3">
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
              className="flex-1 min-w-[140px] py-2 bg-[#16a34a] text-white text-sm font-semibold rounded-lg disabled:opacity-50"
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

          {value?.quote && value.amount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm">
              <p className="font-bold text-[#16a34a]">
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
