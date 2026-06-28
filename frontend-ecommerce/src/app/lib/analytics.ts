declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export function trackMeta(
  event: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined' || !window.fbq) {
    return;
  }
  window.fbq('track', event, params);
}

export function trackMetaCustom(
  event: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined' || !window.fbq) {
    return;
  }
  window.fbq('trackCustom', event, params);
}
