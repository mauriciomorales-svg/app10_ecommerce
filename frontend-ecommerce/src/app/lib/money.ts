/** CLP: siempre entero (evita concatenación string + number en el carrito). */
export function toCLP(n: unknown): number {
  if (n === null || n === undefined) return 0;
  const x = typeof n === 'number' ? n : Number(String(n).replace(/\s/g, ''));
  return Number.isFinite(x) ? Math.round(x) : 0;
}

export function formatCLP(n: unknown): string {
  return toCLP(n).toLocaleString('es-CL', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}
