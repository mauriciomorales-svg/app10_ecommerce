/** Tienda JobsHours: solo dominios jobshours.com (no dondemorales.cl). */
export function shouldUseJobshoursStore(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const host = window.location.hostname.toLowerCase();
  return (
    host.includes('tienda.jobshours') ||
    host.includes('shop.jobshours') ||
    host === 'tienda.jobshours.local'
  );
}

/** Fetch a la API Laravel vía rewrite de Next; fuerza respuestas JSON en errores. */
export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (shouldUseJobshoursStore() && !headers.has('X-Commerce-Store-Slug')) {
    headers.set('X-Commerce-Store-Slug', 'jobshours');
  }

  return fetch(input, { ...init, headers });
}
