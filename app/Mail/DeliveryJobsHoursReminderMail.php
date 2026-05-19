<?php

namespace App\Mail;

use App\Models\Venta;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DeliveryJobsHoursReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Venta $venta,
        public string $customerUrl,
        public int $deliveryAmount
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'DondeMorales — completa el pago de tu envío en JobsHours',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtml(),
        );
    }

    private function buildHtml(): string
    {
        $name = e($this->venta->cliente_nombre ?: 'Cliente');
        $order = e((string) ($this->venta->numero_venta ?? $this->venta->idventa));
        $amount = number_format($this->deliveryAmount, 0, ',', '.');
        $url = e($this->customerUrl);
        $address = e((string) ($this->venta->delivery_address ?? ''));

        return <<<HTML
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
          <h1 style="color:#16a34a">Tu pedido #{$order} está pagado</h1>
          <p>Hola {$name},</p>
          <p>Los <strong>productos</strong> ya están confirmados en DondeMorales.</p>
          <p>Falta un paso: pagar el <strong>envío a domicilio</strong> (~\${$amount}) en JobsHours, donde un repartidor tomará tu mandado.</p>
          <p style="margin:24px 0"><a href="{$url}" style="background:#d97706;color:#fff;padding:14px 24px;border-radius:10px;text-decoration:none;font-weight:bold">Pagar envío en JobsHours</a></p>
          <p style="font-size:14px;color:#555">Destino: {$address}</p>
          <p style="font-size:13px;color:#888">Si no tienes cuenta en JobsHours, usa el mismo email del checkout para iniciar sesión o recuperar contraseña.</p>
        </div>
        HTML;
    }
}
