/** Rastrea qué pack compró el cliente (post-pago en /pago/resultado). */
import { PACK_SKUS } from './jh-data';

const KEY = 'jh_purchase_intent';

export type JhPurchaseIntent = {
  sku: string;
  nombre?: string;
  at: number;
};

export function setJhPurchaseIntent(sku: string, nombre?: string) {
  if (typeof window === 'undefined') return;
  const payload: JhPurchaseIntent = { sku, nombre, at: Date.now() };
  sessionStorage.setItem(KEY, JSON.stringify(payload));
}

export function readJhPurchaseIntent(): JhPurchaseIntent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as JhPurchaseIntent;
    if (!parsed?.sku) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearJhPurchaseIntent() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(KEY);
}

export function isPackExpressIntent(intent: JhPurchaseIntent | null, total?: number): boolean {
  if (intent?.sku === PACK_SKUS.express) return true;
  if (total != null && total >= 198_000 && total <= 201_000) return true;
  return false;
}

export function isPackAndandoIntent(intent: JhPurchaseIntent | null, total?: number): boolean {
  if (intent?.sku === PACK_SKUS.andando) return true;
  if (total != null && total >= 108_000 && total <= 111_000) return true;
  return false;
}
