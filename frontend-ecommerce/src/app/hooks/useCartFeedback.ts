'use client';

import { useCallback } from 'react';
import { useCart, type CartItem } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { resolveCartStock } from '../lib/cartHelpers';
import { buildAddToCartToastCopy, resolveCartLineIncludes } from '../lib/packIncludes';

type AddInput = Omit<CartItem, 'cantidad' | 'line_id'> & { line_id?: string };

export function useCartFeedback() {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const addWithFeedback = useCallback(
    (product: AddInput, options?: { silent?: boolean; message?: string }) => {
      const stock = resolveCartStock(product.stock, product.bundle_configuration);
      const line: AddInput = { ...product, stock };
      addToCart(line);
      if (!options?.silent) {
        if (options?.message) {
          showToast(options.message, { label: 'Ver carrito', href: '/cart' });
          return;
        }
        const includes = resolveCartLineIncludes({ ...line, cantidad: 1 });
        const copy = buildAddToCartToastCopy(product.nombre, includes);
        showToast(copy.message, { label: 'Ver carrito', href: '/cart' }, {
          detail: copy.detail,
          includes: copy.includes,
        });
      }
    },
    [addToCart, showToast],
  );

  return { addWithFeedback };
}
