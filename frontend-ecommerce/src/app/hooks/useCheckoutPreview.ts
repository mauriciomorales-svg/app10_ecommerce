'use client';

import { useEffect, useState } from 'react';
import type { AppliedCoupon } from '../components/CouponInput';
import type { DeliverySelection } from '../components/DeliverySelector';
import type { FulfillmentType } from '../lib/checkout';
import type { CartItem } from '../context/CartContext';

export type CheckoutPreviewTotals = {
  subtotalProductos: number;
  packagingAmount: number;
  couponDiscount: number;
  storeTotal: number;
  deliveryAmount: number;
  deliveryFreeRegaloPack?: boolean;
};

type Args = {
  items: CartItem[];
  packagingKey: string;
  fulfillmentType: FulfillmentType;
  delivery: DeliverySelection | null;
  coupon: AppliedCoupon | null;
  clienteEmail?: string;
  clienteTelefono?: string;
};

export function useCheckoutPreview({
  items,
  packagingKey,
  fulfillmentType,
  delivery,
  coupon,
  clienteEmail,
  clienteTelefono,
}: Args) {
  const [totals, setTotals] = useState<CheckoutPreviewTotals | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setTotals(null);
      return;
    }

    const controller = new AbortController();
    const t = setTimeout(async () => {
      setSyncing(true);
      try {
        const body: Record<string, unknown> = {
          items,
          packaging_key: packagingKey,
          fulfillment_type: fulfillmentType,
          coupon_code: coupon?.codigo,
          email: clienteEmail || undefined,
          telefono: clienteTelefono || undefined,
        };
        if (fulfillmentType === 'delivery' && delivery) {
          body.delivery = { lat: delivery.lat, lng: delivery.lng };
        }

        const res = await fetch('/api/checkout/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok || !data.success) return;

        setTotals({
          subtotalProductos: data.subtotal_productos ?? 0,
          packagingAmount: data.packaging?.amount ?? 0,
          couponDiscount: data.coupon_discount ?? 0,
          storeTotal: data.store_total ?? data.total ?? 0,
          deliveryAmount: data.delivery_amount ?? 0,
          deliveryFreeRegaloPack: Boolean(data.delivery_free_regalo_pack),
        });
      } catch {
        /* aborted or network */
      } finally {
        setSyncing(false);
      }
    }, 350);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [
    items,
    packagingKey,
    fulfillmentType,
    delivery?.lat,
    delivery?.lng,
    delivery?.amount,
    coupon?.codigo,
    coupon?.discount,
    clienteEmail,
    clienteTelefono,
  ]);

  return { totals, syncing };
}
