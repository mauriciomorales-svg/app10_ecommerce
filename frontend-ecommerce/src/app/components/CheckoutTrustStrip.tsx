import { MapPin, ShieldCheck, Truck } from 'lucide-react';

export default function CheckoutTrustStrip({ hasPackReserva }: { hasPackReserva?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs text-brand-muted space-y-2">
      <p className="flex items-start gap-2">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
        <span>
          <strong className="text-brand-ink">Retiro en tienda:</strong> Santiago Watt 205, Renaico · Lun–Dom 9:00–21:00
        </span>
      </p>
      <p className="flex items-start gap-2">
        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
        <span>
          <strong className="text-brand-ink">Reparto Renaico:</strong> ventanas almuerzo 12:30–14:00 y cena 19:00–20:30
          · confirmamos hora por WhatsApp · ideal packs/combos desde $12.000
        </span>
      </p>
      {hasPackReserva && (
        <p className="flex items-start gap-2 text-emerald-800">
          <Truck className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>Packs regalo:</strong> envío gratis en Renaico · preparamos con 24 h de anticipación
          </span>
        </p>
      )}
      <p className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-success" />
        <span>Pago seguro · confirmación por email con detalle de tu pedido</span>
      </p>
    </div>
  );
}
