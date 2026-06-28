'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Package, MapPin, Copy, ExternalLink } from 'lucide-react';
import type { VentaPickupPublic } from '../lib/checkout';
import { DeliveryOrderTimeline } from '../components/DeliveryOrderTimeline';
import StorePageHeader from '../components/StorePageHeader';
import { apiFetch } from '../lib/api';

function SeguimientoContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const expires = searchParams.get('expires');
  const sig = searchParams.get('sig');

  const [venta, setVenta] = useState<VentaPickupPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !expires || !sig) {
      setError('Enlace incompleto. Usa el link que recibiste por correo o en la página de pago.');
      setLoading(false);
      return;
    }

    const qs = `expires=${encodeURIComponent(expires)}&sig=${encodeURIComponent(sig)}`;

    const load = async () => {
      try {
        const res = await apiFetch(`/api/ordenes/${encodeURIComponent(id)}/seguimiento?${qs}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success || !data.venta) {
          setError(data.message || 'No pudimos cargar tu pedido. El enlace puede haber expirado.');
          setVenta(null);
          return;
        }
        setError(null);
        setVenta(data.venta);
      } catch {
        setError('Error de conexión. Intenta de nuevo en unos segundos.');
      } finally {
        setLoading(false);
      }
    };

    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [id, expires, sig]);

  const copyCode = () => {
    if (venta?.codigo_retiro) navigator.clipboard.writeText(venta.codigo_retiro);
  };

  const isDelivery = venta?.fulfillment_type === 'delivery';

  return (
    <div className="max-w-lg w-full">
      <h1 className="font-display text-2xl font-bold text-brand-ink mb-1">Seguimiento de pedido</h1>
      <p className="text-gray-600 text-sm mb-6">Actualización automática cada 30 segundos</p>

      {loading && (
        <div className="flex flex-col items-center py-12 text-gray-600">
          <Loader2 className="h-10 w-10 animate-spin text-brand-primary mb-3" />
          Cargando pedido…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 text-sm mb-4">{error}</div>
      )}

      {!loading && venta && (
        <>
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
            <Package className="h-4 w-4 text-brand-primary" />
            Pedido <strong>#{venta.idventa}</strong>
            {venta.codigo_retiro && (
              <span className="ml-auto font-mono text-brand-primary font-bold">{venta.codigo_retiro}</span>
            )}
          </div>

          {isDelivery ? (
            <DeliveryOrderTimeline venta={venta} />
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-4 text-sm">
              <p className="font-semibold text-emerald-900">Retiro en tienda</p>
              <p className="text-emerald-800 mt-1">
                Estado: <strong>{venta.estado_retiro || 'En preparación'}</strong>
              </p>
            </div>
          )}

          <div className="bg-white border border-emerald-100 rounded-2xl p-4 mb-4 text-sm space-y-2">
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-brand-primary" />
              <div>
                <p>{venta.pickup_address}</p>
                {isDelivery && venta.delivery_address && (
                  <p className="mt-1">Entrega: {venta.delivery_address}</p>
                )}
                {!isDelivery && (
                  <p className="mt-1">Retiro: {venta.fecha_retiro_label || venta.fecha_retiro}</p>
                )}
                <p className="text-gray-500">{venta.pickup_hours}</p>
              </div>
            </div>
            {venta.codigo_retiro && (
              <button
                type="button"
                onClick={copyCode}
                className="inline-flex items-center gap-1 text-brand-primary font-medium"
              >
                <Copy className="h-3.5 w-3.5" /> Copiar código
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="inline-flex justify-center py-3 rounded-xl bg-brand-primary text-white font-medium"
            >
              Volver a la tienda
            </Link>
            {venta.ticket_url && (
              <a
                href={venta.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm"
              >
                <ExternalLink className="h-4 w-4" /> Ver comanda
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function SeguimientoPage() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <Suspense fallback={null}>
        <StorePageHeader backHref="/" backLabel="Tienda" title="Seguimiento" />
      </Suspense>
      <div className="flex items-start justify-center p-4 py-8">
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 md:p-8 w-full max-w-lg">
        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
            </div>
          }
        >
          <SeguimientoContent />
        </Suspense>
      </div>
      </div>
    </div>
  );
}
