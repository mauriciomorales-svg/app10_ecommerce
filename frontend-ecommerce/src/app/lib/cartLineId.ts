import type { CartItem } from '../context/CartContext';

export function buildCartLineId(
  idproducto: number,
  bundle?: CartItem['bundle_configuration']
): string {
  if (
    !bundle ||
    ((!bundle.modifiers || bundle.modifiers.length === 0) &&
      (!bundle.customization || Object.keys(bundle.customization).length === 0) &&
      (!bundle.suggestions || bundle.suggestions.length === 0))
  ) {
    return String(idproducto);
  }

  const payload = JSON.stringify(bundle);
  let hash = 0;
  for (let i = 0; i < payload.length; i += 1) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }

  return `${idproducto}-${Math.abs(hash)}`;
}

export function cartLineId(item: Pick<CartItem, 'line_id' | 'idproducto' | 'bundle_configuration'>): string {
  return item.line_id ?? buildCartLineId(item.idproducto, item.bundle_configuration);
}
