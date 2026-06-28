'use client';

import { useEffect, useState } from 'react';
import ToppisDelDiaPanel, { ToppisDelDiaData } from '../../components/ToppisDelDiaPanel';

export default function ToppisDelDiaPrintPage() {
  const [data, setData] = useState<ToppisDelDiaData | null>(null);

  useEffect(() => {
    fetch('/api/tienda/helados/toppis-del-dia')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  useEffect(() => {
    if (data?.items?.length) {
      document.title = "Toppi's del día — DondeMorales";
    }
  }, [data]);

  return (
    <main className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      {!data && <p className="text-center text-sm text-gray-500">Cargando cartel…</p>}
      {data && !data.items?.length && (
        <p className="mx-auto max-w-md px-4 text-center text-sm text-gray-600">
          Hoy no hay golosinas del minimarket marcadas como Toppi&apos;s extra. Revisa stock con vencimiento
          próximo en inventario.
        </p>
      )}
      <ToppisDelDiaPanel data={data} variant="print" />
      {data?.items?.length ? (
        <div className="mx-auto mt-6 max-w-2xl px-4 text-center print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-rose-700 px-6 py-3 text-sm font-bold text-white hover:bg-rose-800"
          >
            Imprimir cartel
          </button>
        </div>
      ) : null}
    </main>
  );
}
