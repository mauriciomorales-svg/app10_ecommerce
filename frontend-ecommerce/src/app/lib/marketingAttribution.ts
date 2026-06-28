const STORAGE_KEY = 'dm_marketing_attribution';

export type MarketingAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string | null;
  landing_path?: string;
  captured_at?: string;
};

function readRaw(): MarketingAttribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MarketingAttribution;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/** Captura first-touch UTM desde la URL (sesión actual). */
export function captureMarketingAttributionFromUrl(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
  const hasUtm = utmKeys.some((k) => Boolean(params.get(k)));
  const existing = readRaw();

  if (!hasUtm && existing) return;

  const next: MarketingAttribution = {
    utm_source: params.get('utm_source') || existing?.utm_source,
    utm_medium: params.get('utm_medium') || existing?.utm_medium,
    utm_campaign: params.get('utm_campaign') || existing?.utm_campaign,
    utm_content: params.get('utm_content') || existing?.utm_content,
    utm_term: params.get('utm_term') || existing?.utm_term,
    referrer: document.referrer || existing?.referrer || null,
    landing_path: existing?.landing_path || `${window.location.pathname}${window.location.search}`,
    captured_at: new Date().toISOString(),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function readMarketingAttribution(): MarketingAttribution | null {
  return readRaw();
}

/** Payload para checkout / eventos backend. */
export function getMarketingAttributionPayload(): Record<string, string | null> {
  const a = readRaw();
  if (!a) {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
      landing_path: typeof window !== 'undefined' ? window.location.pathname : null,
    };
  }

  return {
    utm_source: a.utm_source ?? null,
    utm_medium: a.utm_medium ?? null,
    utm_campaign: a.utm_campaign ?? null,
    referrer: a.referrer ?? null,
    landing_path: a.landing_path ?? null,
  };
}

export function isJobshoursHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('jobshours');
}

export function analyticsSiteId(): 'dondemorales' | 'jobshours' {
  return isJobshoursHost() ? 'jobshours' : 'dondemorales';
}
