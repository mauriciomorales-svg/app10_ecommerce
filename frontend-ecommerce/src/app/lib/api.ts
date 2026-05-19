/** Fetch a la API Laravel vía rewrite de Next; fuerza respuestas JSON en errores. */
export function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  return fetch(input, { ...init, headers });
}
