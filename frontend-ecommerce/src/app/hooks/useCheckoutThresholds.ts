'use client';

import { useEffect, useState } from 'react';

export type CheckoutThresholds = {
  freeReinforcedFrom: number;
  freeGiftBoxFrom: number;
  minOrderProducts: number;
};

const DEFAULTS: CheckoutThresholds = {
  freeReinforcedFrom: 10000,
  freeGiftBoxFrom: 25000,
  minOrderProducts: 0,
};

export function useCheckoutThresholds(subtotal: number) {
  const [thresholds, setThresholds] = useState<CheckoutThresholds>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/checkout/options?subtotal=${Math.max(0, subtotal)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        setThresholds({
          freeReinforcedFrom: data.thresholds?.free_reinforced_from ?? DEFAULTS.freeReinforcedFrom,
          freeGiftBoxFrom: data.thresholds?.free_gift_box_from ?? DEFAULTS.freeGiftBoxFrom,
          minOrderProducts: data.min_order_products ?? DEFAULTS.minOrderProducts,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [subtotal]);

  return { thresholds, loading };
}
