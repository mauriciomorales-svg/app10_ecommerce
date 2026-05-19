'use client';

import { CheckCircle2, Circle, Loader2, Truck, MessageCircle } from 'lucide-react';

export type DeliveryTimelineVenta = {
  idventa: number;
  jobshours_request_id?: number | null;
  jobshours_delivery_url?: string | null;
  jobshours_publish_status?: string | null;
  jobshours_delivery_status?: string | null;
  jobshours_request_status?: string | null;
  jobshours_payment_status?: string | null;
  delivery_amount?: number;
  whatsapp_delivery_url?: string | null;
};

type StepState = 'done' | 'active' | 'pending' | 'error';

type Step = {
  id: string;
  title: string;
  hint: string;
  state: StepState;
};

function resolveSteps(v: DeliveryTimelineVenta): Step[] {
  const jhStatus = (v.jobshours_request_status || '').toLowerCase();
  const payStatus = (v.jobshours_payment_status || '').toLowerCase();
  const published =
    Boolean(v.jobshours_request_id) ||
    v.jobshours_publish_status === 'published' ||
    v.jobshours_publish_status === 'skipped';
  const publishFailed = v.jobshours_publish_status === 'failed';

  const deliveryPaid =
    payStatus === 'completed' || ['accepted', 'taken', 'in_progress', 'completed'].includes(jhStatus);
  const assigned = ['accepted', 'taken', 'in_progress', 'completed'].includes(jhStatus);
  const enRoute = jhStatus === 'in_progress' || jhStatus === 'completed';
  const delivered = jhStatus === 'completed';

  const step2State: StepState = publishFailed
    ? 'error'
    : deliveryPaid
      ? 'done'
      : published
        ? 'active'
        : 'pending';

  return [
    {
      id: 'products',
      title: 'Productos pagados',
      hint: `DondeMorales — pedido #${v.idventa}`,
      state: 'done',
    },
    {
      id: 'pay_delivery',
      title: 'Paga el envío en JobsHours',
      hint: `Referencia ~$${(v.delivery_amount ?? 0).toLocaleString('es-CL')} — el repartidor cobra en la app`,
      state: step2State,
    },
    {
      id: 'assigned',
      title: 'Repartidor asignado',
      hint: assigned ? 'Un profesional tomó tu mandado' : 'Tras pagar el envío, un repartidor podrá tomarlo',
      state: assigned ? (enRoute || delivered ? 'done' : 'active') : deliveryPaid ? 'pending' : 'pending',
    },
    {
      id: 'en_route',
      title: 'En camino',
      hint: enRoute ? 'Tu pedido va hacia tu dirección' : 'Te avisaremos cuando salga',
      state: delivered ? 'done' : enRoute ? 'active' : 'pending',
    },
    {
      id: 'delivered',
      title: 'Entregado',
      hint: delivered ? '¡Listo! Gracias por tu compra' : 'Confirmación al completar en JobsHours',
      state: delivered ? 'done' : 'pending',
    },
  ];
}

function StepIcon({ state }: { state: StepState }) {
  if (state === 'done') return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
  if (state === 'active') return <Loader2 className="h-5 w-5 text-amber-600 animate-spin shrink-0" />;
  if (state === 'error') return <Circle className="h-5 w-5 text-red-500 shrink-0" />;
  return <Circle className="h-5 w-5 text-gray-300 shrink-0" />;
}

export function DeliveryOrderTimeline({
  venta,
  showActions = true,
}: {
  venta: DeliveryTimelineVenta;
  showActions?: boolean;
}) {
  const steps = resolveSteps(venta);
  const payStepActive = steps.find((s) => s.id === 'pay_delivery')?.state === 'active';
  const publishFailed = venta.jobshours_publish_status === 'failed';

  return (
    <div className="space-y-2 mb-4">
      {steps.map((step) => {
        const bg =
          step.state === 'done'
            ? 'bg-emerald-50 border-emerald-200'
            : step.state === 'active'
              ? 'bg-amber-50 border-amber-300'
              : step.state === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-gray-50 border-gray-200 opacity-70';

        return (
          <div key={step.id} className={`flex gap-3 p-3 rounded-xl border ${bg}`}>
            <div className="pt-0.5">
              <StepIcon state={step.state} />
            </div>
            <div className="flex-1 text-sm min-w-0">
              <p className="font-semibold text-gray-900">{step.title}</p>
              <p className="text-xs text-gray-600 mt-0.5">{step.hint}</p>
              {step.id === 'pay_delivery' && venta.jobshours_delivery_status && step.state !== 'pending' && (
                <p className="text-xs text-amber-800 mt-1">
                  Estado: <strong>{venta.jobshours_delivery_status}</strong>
                </p>
              )}
              {publishFailed && step.id === 'pay_delivery' && (
                <p className="text-xs text-red-600 mt-2">
                  No pudimos publicar el envío automáticamente. La tienda lo reintentará.
                </p>
              )}
              {showActions && payStepActive && step.id === 'pay_delivery' && venta.jobshours_delivery_url && (
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href={venta.jobshours_delivery_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm"
                  >
                    <Truck className="h-4 w-4" />
                    Pagar envío en JobsHours
                  </a>
                  {venta.whatsapp_delivery_url && (
                    <a
                      href={venta.whatsapp_delivery_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 py-2.5 border border-emerald-300 text-emerald-800 font-medium rounded-xl text-sm bg-white"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Abrir enlace por WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}