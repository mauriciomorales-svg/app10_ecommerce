'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, MapPin, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCommerceStore } from '../../context/CommerceStoreContext';
import type { VentaPickupPublic } from '../../lib/checkout';
import { DeliveryOrderTimeline } from '../../components/DeliveryOrderTimeline';
import StorePageHeader from '../../components/StorePageHeader';
import { apiFetch } from '../../lib/api';
import { trackMeta } from '../../lib/analytics';
import {
  JobsHoursGenericPostPurchase,
  JobsHoursPackExpressPostPurchase,
} from '../../jobshours/JobsHoursPackExpressPostPurchase';
import PostPurchaseShare from '../../components/PostPurchaseShare';
import {
  clearJhPurchaseIntent,
  isPackAndandoIntent,
  isPackExpressIntent,
  readJhPurchaseIntent,
  type JhPurchaseIntent,
} from '../../jobshours/jh-purchase-intent';

const MAX_POLL_ATTEMPTS = 36;

function PagoResultadoContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { isJobshours, store } = useCommerceStore();
  const provider = searchParams.get('provider') || 'flow';
  const token = searchParams.get('token');
  const ventaId = searchParams.get('venta_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando pago...');
  const [venta, setVenta] = useState<VentaPickupPublic | null>(null);
  const [jhIntent, setJhIntent] = useState<JhPurchaseIntent | null>(null);
  const attemptsRef = useRef(0);
  const purchaseTrackedRef = useRef(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const finishSuccess = (v: VentaPickupPublic) => {
      if (!purchaseTrackedRef.current) {
        purchaseTrackedRef.current = true;
        trackMeta('Purchase', {
          value: Number(v.total ?? 0),
          currency: 'CLP',
        });
      }
      setVenta(v);
      let intent: JhPurchaseIntent | null = null;
      if (isJobshours && v.fulfillment_type !== 'delivery' && typeof window !== 'undefined') {
        intent = readJhPurchaseIntent();
        setJhIntent(intent);
        clearJhPurchaseIntent();
      }
      setStatus('success');
      const total = Number(v.total ?? 0);
      const packExpress = isJobshours && isPackExpressIntent(intent, total);
      const packAndando = isJobshours && isPackAndandoIntent(intent, total);
      setMessage(
        isJobshours && v.fulfillment_type !== 'delivery'
          ? packExpress
            ? 'Pack Express confirmado. Coordinamos entrega de tablet en los prÃ³ximos dÃ­as.'
            : packAndando
              ? 'Pago confirmado. Coordinamos instalaciÃ³n en tu local por WhatsApp.'
              : 'Pago confirmado. Te contactamos por WhatsApp en 24 h para coordinar la implementaciÃ³n.'
          : v.fulfillment_type === 'delivery'
            ? isJobshours
              ? 'Productos pagados. Completa el envÃ­o en JobsHours (paso 2).'
              : 'Pago confirmado. Estamos coordinando tu envÃ­o a domicilio; te contactaremos por WhatsApp.'
            : 'Pago confirmado. Tu pedido estÃ¡ listo para preparar. Retira en Watt 205 con tu cÃ³digo.',
      );
      clearCart();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('cart');
        sessionStorage.removeItem('dm_pending_checkout');
      }
    };

    const bumpAttempt = (): boolean => {
      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
        setStatus('error');
        setMessage(
          'El pago tarda mÃ¡s de lo habitual. Si ya pagaste, guarda tu comprobante y escrÃ­benos por WhatsApp.',
        );
        if (interval) clearInterval(interval);
        return true;
      }
      return false;
    };

    const applyVenta = (v: VentaPickupPublic | undefined) => {
      if (!v) return;
      setVenta(v);
      if (String(v.estado).toLowerCase() === 'pagado') {
        if (v.fulfillment_type !== 'delivery') {
          finishSuccess(v);
          if (interval) clearInterval(interval);
          return;
        }
        const published =
          v.jobshours_request_id ||
          v.jobshours_publish_status === 'published' ||
          v.jobshours_publish_status === 'skipped';
        const failed = v.jobshours_publish_status === 'failed';
        if (published || failed) {
          finishSuccess(v);
          if (interval && v.jobshours_request_status === 'completed') {
            clearInterval(interval);
          }
        } else {
          setStatus('success');
          setMessage('Productos pagados. Coordinando tu envÃ­oâ€¦');
        }
      }
    };

    if (provider === 'mp') {
      if (!ventaId) {
        setStatus('error');
        setMessage('Pedido no vï¿½lido');
        return;
      }
      const poll = async () => {
        if (bumpAttempt()) return;
        try {
          const res = await apiFetch(`/api/pagos/mp-online/status?venta_id=${encodeURIComponent(ventaId)}`);
          const data = await res.json();
          if (!data.success) {
            setMessage('Procesando pago...');
            return;
          }
          applyVenta(data.venta);
          const estado = String(data.estado ?? '').toLowerCase();
          if (estado === 'rechazado') {
            setStatus('error');
            setMessage('El pago fue rechazado');
            if (interval) clearInterval(interval);
          } else if (estado !== 'pagado') {
            setMessage('Procesando pago...');
          }
        } catch {
          setMessage('Reintentando verificaciï¿½n...');
        }
      };
      poll();
      interval = setInterval(poll, 5000);
      return () => {
        if (interval) clearInterval(interval);
      };
    }

    if (!token) {
      setStatus('error');
      setMessage('Token no vï¿½lido');
      return;
    }

    const pollFlow = () => {
      if (bumpAttempt()) return;
      fetch(`/api/pagos/flow/confirm?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          applyVenta(data.venta);
          if (String(data.venta?.estado ?? '').toLowerCase() === 'pagado') {
            const v = data.venta as VentaPickupPublic;
            if (v.fulfillment_type !== 'delivery') {
              if (interval) clearInterval(interval);
              return;
            }
            if (
              v.jobshours_request_id ||
              v.jobshours_publish_status === 'published' ||
              v.jobshours_publish_status === 'failed' ||
              v.jobshours_publish_status === 'skipped'
            ) {
              if (interval) clearInterval(interval);
            }
            return;
          }
          const estado = String(data.venta?.estado ?? '').toLowerCase();
          if (estado === 'rechazado') {
            setStatus('error');
            setMessage('El pago fue rechazado');
            if (interval) clearInterval(interval);
          } else if (!data.venta && data.success === false) {
            setStatus('error');
            setMessage('El pago no pudo ser procesado');
            if (interval) clearInterval(interval);
          } else {
            setMessage('Procesando pago...');
          }
        })
        .catch(() => {
          setMessage('Reintentando verificaciï¿½n...');
        });
    };

    pollFlow();
    interval = setInterval(pollFlow, 5000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [provider, token, ventaId, clearCart, isJobshours]);

  useEffect(() => {
    if (status !== 'success' || venta?.fulfillment_type !== 'delivery' || !venta.idventa) return;
    if (venta.jobshours_request_status === 'completed') return;

    const poll = async () => {
      try {
        const q =
          provider === 'mp' && ventaId
            ? `venta_id=${encodeURIComponent(ventaId)}`
            : venta.idventa
              ? `venta_id=${encodeURIComponent(String(venta.idventa))}`
              : null;
        if (!q) return;
        const res = await apiFetch(`/api/pagos/mp-online/status?${q}`);
        const data = await res.json();
        if (data.success && data.venta) {
          setVenta((prev) => (prev ? { ...prev, ...data.venta } : data.venta));
        }
      } catch {
        /* ignore */
      }
    };

    poll();
    const t = setInterval(poll, 30000);
    return () => clearInterval(t);
  }, [status, venta?.idventa, venta?.fulfillment_type, venta?.jobshours_request_status, provider, ventaId]);

  const copyCode = () => {
    if (venta?.codigo_retiro) navigator.clipboard.writeText(venta.codigo_retiro);
  };

  const isDelivery = venta?.fulfillment_type === 'delivery';
  const jhReady = Boolean(venta?.jobshours_delivery_url || venta?.jobshours_request_id);
  const jhFailed = venta?.jobshours_publish_status === 'failed';

  return (
    <div className="max-w-md w-full text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="h-16 w-16 text-brand-primary animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Procesando pago</h1>
          <p className="text-gray-600">{message}</p>
        </>
      )}

      {status === 'success' && venta && (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-brand-success mb-2">Pago exitoso</h1>
          <p className="text-gray-600 mb-4">{message}</p>

          {isDelivery && (
            <>
              {!jhReady && !jhFailed && isJobshours && (
                <p className="text-xs text-gray-500 mb-3 flex items-center justify-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Publicando mandado en JobsHoursâ€¦
                </p>
              )}
              <DeliveryOrderTimeline venta={venta} />
            </>
          )}

          {isJobshours && !isDelivery && (
            isPackExpressIntent(jhIntent, Number(venta.total ?? 0)) ||
            isPackAndandoIntent(jhIntent, Number(venta.total ?? 0)) ? (
              <JobsHoursPackExpressPostPurchase venta={venta} intent={jhIntent} />
            ) : (
              <JobsHoursGenericPostPurchase venta={venta} />
            )
          )}

          {!isJobshours && status === 'success' && venta && (
            <PostPurchaseShare codigoRetiro={venta.codigo_retiro ?? undefined} />
          )}

          <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-5 text-left space-y-3 mb-4">
            <p className="text-sm text-gray-600">
              Pedido <strong>#{venta.idventa}</strong>
            </p>
            <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-100">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {isJobshours ? 'Referencia de pago' : 'CÃ³digo de retiro / referencia'}
                </p>
                <p className="text-3xl font-black text-brand-primary tracking-widest">{venta.codigo_retiro}</p>
              </div>
              <button type="button" onClick={copyCode} className="p-2 text-brand-primary" title="Copiar cÃ³digo">
                <Copy className="h-5 w-5" />
              </button>
            </div>
            {!isJobshours && (
            <div className="flex gap-2 text-sm text-gray-700">
              <MapPin className="h-4 w-4 shrink-0 text-brand-primary" />
              <div>
                <p className="font-medium">{venta.pickup_address}</p>
                {isDelivery && venta.delivery_address ? (
                  <p className="mt-1">Entrega: {venta.delivery_address}</p>
                ) : (
                  <p>Retiro: {venta.fecha_retiro_label || venta.fecha_retiro}</p>
                )}
                <p>{venta.pickup_hours}</p>
              </div>
            </div>
            )}
            {isJobshours && store?.brand?.support_hours && (
              <p className="text-sm text-gray-600">
                Soporte: {store.brand.support_hours} Â· {store.brand.whatsapp ?? '+56 9 6513 3289'}
              </p>
            )}
            {venta.packaging_label && (
              <p className="text-sm text-gray-600">
                Empaque: <strong>{venta.packaging_label}</strong>
              </p>
            )}
          </div>

          {venta.tracking_url && (
            <a
              href={venta.tracking_url}
              className="inline-flex w-full items-center justify-center gap-2 px-6 py-3 mb-3 border-2 border-brand-primary text-brand-primary font-semibold rounded-xl bg-white"
            >
              <ExternalLink className="h-4 w-4" />
              Seguir mi pedido
            </a>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/packs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl"
            >
              Reservar otro pack
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-brand-primary/30 text-brand-primary rounded-xl hover:bg-emerald-50"
            >
              Volver a la tienda
            </Link>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-red-600 mb-2">Pago no completado</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link href="/checkout" className="block px-6 py-3 bg-brand-primary text-white rounded-xl mb-2">
            Intentar nuevamente
          </Link>
        </>
      )}
    </div>
  );
}

export default function PagoResultadoPage() {
  return (
    <div className="min-h-screen bg-brand-surface">
      <Suspense fallback={null}>
        <StorePageHeader backHref="/" backLabel="Tienda" title="Resultado del pago" />
      </Suspense>
      <div className="flex items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 sm:p-8 w-full max-w-lg">
          <Suspense fallback={<Loader2 className="h-16 w-16 text-brand-primary animate-spin mx-auto" />}>
            <PagoResultadoContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
