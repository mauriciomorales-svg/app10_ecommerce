import type { CartItem } from '../context/CartContext';

/** Líneas personalizadas (pack/helado/combo) — no mostrar stock ficticio */
export function isBundleCartLine(item: CartItem): boolean {
  return item.bundle_configuration != null;
}

/** Stock interno para líneas bundle (sin límite artificial en UI) */
export const BUNDLE_CART_STOCK = 999;

export function resolveCartStock(
  stock: number,
  bundle?: CartItem['bundle_configuration'],
): number {
  if (bundle != null) return BUNDLE_CART_STOCK;
  return typeof stock === 'number' && stock > 0 ? stock : 1;
}
