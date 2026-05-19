<?php

namespace App\Mail;

use App\Models\Venta;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderPaidConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Venta $venta,
        public string $trackingUrl,
        public ?string $jobsHoursUrl = null,
    ) {}

    public function envelope(): Envelope
    {
        $order = $this->venta->numero_venta ?? $this->venta->idventa;

        return new Envelope(
            subject: "DondeMorales — pedido #{$order} confirmado",
        );
    }

    public function content(): Content
    {
        return new Content(htmlString: $this->buildHtml());
    }

    private function buildHtml(): string
    {
        $name = e($this->venta->cliente_nombre ?: 'Cliente');
        $order = e((string) ($this->venta->numero_venta ?? $this->venta->idventa));
        $code = e((string) ($this->venta->codigo_retiro ?? ''));
        $track = e($this->trackingUrl);
        $isDelivery = (string) ($this->venta->fulfillment_type ?? 'pickup') === 'delivery';
        $jhBlock = '';

        if ($isDelivery && $this->jobsHoursUrl) {
            $jh = e($this->jobsHoursUrl);
            $amount = number_format((int) round((float) ($this->venta->delivery_amount ?? 0)), 0, ',', '.');
            $jhBlock = <<<HTML
            <p>Para envío a domicilio, completa el <strong>pago del envío</strong> (~\${$amount}) en JobsHours:</p>
            <p style="margin:16px 0"><a href="{$jh}" style="background:#d97706;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Pagar envío en JobsHours</a></p>
            HTML;
        }

        $modalidad = $isDelivery ? 'envío a domicilio' : 'retiro en tienda';

        return <<<HTML
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
          <h1 style="color:#16a34a">¡Pago recibido!</h1>
          <p>Hola {$name},</p>
          <p>Tu pedido <strong>#{$order}</strong> ({$modalidad}) está confirmado en DondeMorales.</p>
          <p>Referencia / código: <strong style="letter-spacing:2px">{$code}</strong></p>
          {$jhBlock}
          <p>Puedes ver el estado en cualquier momento:</p>
          <p style="margin:24px 0"><a href="{$track}" style="background:#16a34a;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Seguir mi pedido</a></p>
          <p style="font-size:13px;color:#888">Guarda este enlace; no requiere iniciar sesión.</p>
        </div>
        HTML;
    }
}
