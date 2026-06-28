const KEY = 'dm_search_recent';

export function readRecentSearches(scope: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return Array.isArray(parsed[scope]) ? parsed[scope].slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(scope: string, query: string): void {
  const q = query.trim();
  if (q.length < 2 || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: Record<string, string[]> = raw ? JSON.parse(raw) : {};
    const prev = (parsed[scope] ?? []).filter((x) => x.toLowerCase() !== q.toLowerCase());
    parsed[scope] = [q, ...prev].slice(0, 5);
    localStorage.setItem(KEY, JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}
