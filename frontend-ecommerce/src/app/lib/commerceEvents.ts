const SESSION_KEY = 'dm_session_id';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getCommerceSessionId(): string {
  return getSessionId();
}

export function trackCommerceEvent(
  event: string,
  payload: Record<string, unknown> = {},
) {
  if (typeof window === 'undefined') return;
  fetch('/api/commerce/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      payload,
      session_id: getSessionId(),
      page: window.location.pathname,
    }),
  }).catch(() => {});
}

/** Registra una vista de página (DondeMorales / JobsHours). */
export function trackPageView(extra: Record<string, unknown> = {}) {
  const site =
    typeof extra.site === 'string'
      ? extra.site
      : typeof window !== 'undefined' && window.location.hostname.includes('jobshours')
        ? 'jobshours'
        : 'dondemorales';

  trackCommerceEvent('page_view', {
    site,
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    host: typeof window !== 'undefined' ? window.location.host : '',
    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    ...extra,
  });
}
