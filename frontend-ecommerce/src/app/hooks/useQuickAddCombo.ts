'use client';

import { useCallback, useState } from 'react';
import { useCartFeedback } from './useCartFeedback';
import { resolveCartStock } from '../lib/cartHelpers';
import { buildQuickAddCartItem, canQuickAdd, type ProductQuickAddPayload } from '../lib/quickAddCombo';

export function useQuickAddCombo(onOpenBuilder: (productId: number) => void) {
  const { addWithFeedback } = useCartFeedback();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const quickAddOrOpen = useCallback(
    async (productId: number) => {
      if (loadingId != null) return;
      setLoadingId(productId);
      try {
        const res = await fetch(`/api/productos/${productId}`);
        if (!res.ok) {
          onOpenBuilder(productId);
          return;
        }
        const product = (await res.json()) as ProductQuickAddPayload;
        if (!canQuickAdd(product)) {
          onOpenBuilder(productId);
          return;
        }
        const item = buildQuickAddCartItem(product);
        addWithFeedback({
          ...item,
          stock: resolveCartStock(item.stock, item.bundle_configuration),
        });
      } catch {
        onOpenBuilder(productId);
      } finally {
        setLoadingId(null);
      }
    },
    [addWithFeedback, loadingId, onOpenBuilder],
  );

  return { quickAddOrOpen, loadingId };
}
