'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'jh_analytics_key';

type DayRow = { date: string; page_views: number; unique_sessions: number };
type PageRow = { page: string; page_views: number; unique_sessions: number };

type StatsPayload = {
  available: boolean;
  message?: string;
  period_days: number;
  site: string | null;
  generated_at: string;
  totals: {
    page_views: number;
    unique_sessions: number;
    today_page_views: number;
    today_unique_sessions: number;
  };
  by_day: DayRow[];
  by_page: PageRow[];
};

function formatNumber(n: number) {
  return new Intl.NumberFormat('es-CL').format(n);
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export default function VisitasDashboardPage() {
  const [keyInput, setKeyInput] = useState('');
  const [storedKey, setStoredKey] = useState('');
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) setStoredKey(saved);
  }, []);

  const maxDayViews = useMemo(() => {
    if (!stats?.by_day?.length) return 1;
    return Math.max(1, ...stats.by_day.map((d) => d.page_views));
  }, [stats]);

  const loadStats = useCallback(
    async (key: string, period: number) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/commerce/visits/stats?days=${period}&site=jobshours`, {
          headers: { 'X-JH-Analytics-Key': key },
        });
        const data = await res.json();
        if (!res.ok) {
          setStats(null);
          setError(data.message || 'No se pudieron cargar las visitas.');
          return;
        }
        setStats(data.stats as StatsPayload);
      } catch {
        setError('Error de red al consultar visitas.');
        setStats(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (storedKey) loadStats(storedKey, days);
  }, [storedKey, days, loadStats]);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    sessionStorage.setItem(STORAGE_KEY, trimmed);
    setStoredKey(trimmed);
  }

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setStoredKey('');
    setStats(null);
    setKeyInput('');
  }

  if (!storedKey) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <h1 className="font-display text-2xl font-black text-[var(--jh-ink)]">Visitas JobsHours</h1>
        <p className="mt-2 text-sm text-[var(--jh-muted)]">
          Panel interno. Ingresa la clave definida en el servidor (<code>JH_ANALYTICS_KEY</code>).
        </p>
        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <label className="block text-sm font-bold text-[var(--jh-ink)]">
            Clave de acceso
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[var(--jh-line)] px-4 py-3 text-base"
              autoComplete="off"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--jh-green)] px-4 py-3 text-sm font-black text-[var(--jh-ink)]"
          >
            Ver estadísticas
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--jh-line)] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--jh-green-dark)]">
            JobsHours · Analytics
          </p>
          <h1 className="font-display text-3xl font-black text-[var(--jh-ink)]">Visitas a la tienda</h1>
          <p className="mt-1 text-sm text-[var(--jh-muted)]">
            Cuenta vistas de página en tienda.jobshours.com (home, comida, catálogo, etc.).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-[var(--jh-line)] px-3 py-2 text-sm font-semibold"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
          <button
            type="button"
            onClick={() => loadStats(storedKey, days)}
            className="rounded-lg border border-[var(--jh-line)] px-3 py-2 text-sm font-bold"
          >
            Actualizar
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--jh-muted)]"
          >
            Salir
          </button>
        </div>
      </header>

      {loading && <p className="mt-8 text-sm text-[var(--jh-muted)]">Cargando…</p>}
      {error && (
        <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}

      {stats?.available && (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Hoy · vistas', value: stats.totals.today_page_views },
              { label: 'Hoy · visitantes', value: stats.totals.today_unique_sessions },
              { label: `Período · vistas (${days} d)`, value: stats.totals.page_views },
              { label: 'Período · sesiones únicas', value: stats.totals.unique_sessions },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-[var(--jh-line)] bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--jh-muted)]">{card.label}</p>
                <p className="mt-2 text-3xl font-black text-[var(--jh-ink)]">{formatNumber(card.value)}</p>
              </div>
            ))}
          </section>

          <section className="mt-10 rounded-2xl border border-[var(--jh-line)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--jh-ink)]">Vistas por día</h2>
            {stats.by_day.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--jh-muted)]">Aún no hay datos en este período.</p>
            ) : (
              <div className="mt-6 flex items-end gap-1 overflow-x-auto pb-2" style={{ minHeight: 180 }}>
                {stats.by_day.map((row) => (
                  <div key={row.date} className="flex min-w-[28px] flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-[var(--jh-muted)]">{row.page_views}</span>
                    <div
                      className="w-full max-w-[36px] rounded-t-md bg-[var(--jh-green)]"
                      style={{ height: `${Math.max(8, (row.page_views / maxDayViews) * 140)}px` }}
                      title={`${row.date}: ${row.page_views} vistas`}
                    />
                    <span className="text-[10px] font-semibold text-[var(--jh-muted)]">{formatDate(row.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-10 rounded-2xl border border-[var(--jh-line)] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-[var(--jh-ink)]">Páginas más visitadas</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--jh-line)] text-xs uppercase tracking-wide text-[var(--jh-muted)]">
                    <th className="py-2 pr-4 font-bold">Ruta</th>
                    <th className="py-2 pr-4 font-bold">Vistas</th>
                    <th className="py-2 font-bold">Sesiones</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.by_page.map((row) => (
                    <tr key={row.page} className="border-b border-[var(--jh-line)]/60">
                      <td className="py-3 pr-4 font-mono text-xs sm:text-sm">{row.page}</td>
                      <td className="py-3 pr-4 font-bold">{formatNumber(row.page_views)}</td>
                      <td className="py-3 font-semibold text-[var(--jh-muted)]">
                        {formatNumber(row.unique_sessions)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-8 text-xs text-[var(--jh-muted)]">
            Actualizado: {new Date(stats.generated_at).toLocaleString('es-CL')} · Solo cuenta páginas JobsHours
            (no flyers HTML estáticos).
          </p>
        </>
      )}

      {stats && !stats.available && (
        <p className="mt-8 text-sm text-[var(--jh-muted)]">{stats.message || 'Analytics no disponible.'}</p>
      )}
    </main>
  );
}
