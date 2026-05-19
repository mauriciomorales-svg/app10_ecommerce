<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Services\CheckoutOrderService;
use App\Services\CheckoutPriceService;
use App\Services\PackagingService;
use App\Services\JobsHoursDeliveryStatusService;
use App\Services\PickupFulfillmentService;
use App\Support\CheckoutRequestValidator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MercadoPagoOnlineController extends Controller
{
    private string $accessToken;
    private string $baseUrl = 'https://api.mercadopago.com';

    public function __construct()
    {
        $this->accessToken = (string) (config('services.mercadopago.access_token', '') ?: '');
    }

    /**
     * Crea una venta pendiente + Checkout Preferences (MP online).
     * Body: { items: [...], cliente: {...}, total: number }
     *
     * POST /api/pagos/mp-online
     */
    public function iniciar(Request $request)
    {
        if (!$this->isEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Mercado Pago online está deshabilitado temporalmente',
                'code' => 'PAYMENT_PROVIDER_DISABLED',
            ], 503);
        }

        if (empty($this->accessToken)) {
            return response()->json([
                'success' => false,
                'message' => 'Mercado Pago no está configurado (access_token faltante)',
            ], 503);
        }

        $checkout = CheckoutRequestValidator::validatePaymentStart($request);
        $cliente = $checkout['cliente'];
        $packagingKey = $checkout['packaging_key'];
        $items = $checkout['items'];

        $venta = CheckoutOrderService::createPendingOrder(
            $items,
            $cliente,
            $packagingKey,
            'mercadopago',
            $checkout['fulfillment_type'],
            $checkout['delivery'],
            $checkout['totals']
        );
        $packaging = $checkout['totals']['packaging'];
        $total = (float) $venta->total;

        $frontendUrl = rtrim((string) env('FRONTEND_URL', 'https://www.dondemorales.cl'), '/');
        $apiUrl = rtrim((string) env('API_URL', $frontendUrl), '/');

        $notificationUrl = $apiUrl . '/api/pagos/mp-online/webhook';

        $payerEmail = (string) ($cliente['email'] ?? '') ?: 'cliente@dondemorales.cl';

        $mpItems = array_map(function ($item) {
            return [
                'id' => 'p-' . (int) $item['idproducto'],
                'title' => (string) ($item['nombre'] ?? ('Producto ' . (int) $item['idproducto'])),
                'quantity' => (int) $item['cantidad'],
                'unit_price' => (float) $item['precio_venta'],
                'currency_id' => 'CLP',
            ];
        }, $items);

        if ($packaging['amount'] > 0) {
            $mpItems[] = [
                'id' => 'packaging-'.$packaging['key'],
                'title' => (string) $packaging['label'],
                'quantity' => 1,
                'unit_price' => (float) $packaging['amount'],
                'currency_id' => 'CLP',
            ];
        }

        $payload = [
            'items' => $mpItems,
            'payer' => [
                'email' => $payerEmail,
            ],
            'external_reference' => 'venta-' . $venta->idventa,
            'notification_url' => $notificationUrl,
            'back_urls' => [
                'success' => $frontendUrl . '/pago/resultado?provider=mp&venta_id=' . $venta->idventa,
                'failure' => $frontendUrl . '/pago/resultado?provider=mp&venta_id=' . $venta->idventa . '&status=failure',
                'pending' => $frontendUrl . '/pago/resultado?provider=mp&venta_id=' . $venta->idventa . '&status=pending',
            ],
            'auto_return' => 'approved',
            'statement_descriptor' => 'DondeMorales',
        ];

        $response = Http::withToken($this->accessToken)
            ->post($this->baseUrl . '/checkout/preferences', $payload);

        if (!$response->successful()) {
            Log::error('[MP online] Error creando preference', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            // Limpieza básica para no dejar venta colgada si MP falla
            $venta->update(['estado' => 'rechazado', 'fecha_finalizada' => now()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al generar link de pago Mercado Pago',
            ], 502);
        }

        $data = $response->json();
        $initPoint = config('app.env') === 'production'
            ? ($data['init_point'] ?? null)
            : ($data['sandbox_init_point'] ?? null);

        if (empty($initPoint) || empty($data['id'] ?? null)) {
            return response()->json([
                'success' => false,
                'message' => 'Mercado Pago respondió sin init_point',
            ], 502);
        }

        return response()->json([
            'success' => true,
            'url' => $initPoint,
            'preference_id' => $data['id'],
            'venta_id' => $venta->idventa,
        ]);
    }

    /**
     * Status simple por venta_id (para frontend polling).
     * GET /api/pagos/mp-online/status?venta_id=123
     */
    public function status(Request $request)
    {
        $request->validate([
            'venta_id' => 'required|integer',
        ]);

        $ventaId = (int) $request->query('venta_id');
        $venta = Venta::find($ventaId);
        if (!$venta) {
            return response()->json(['success' => false, 'message' => 'Venta no encontrada'], 404);
        }

        $payload = [
            'success' => true,
            'venta_id' => $venta->idventa,
            'estado' => $venta->estado,
            'medio_pago' => $venta->medio_pago,
        ];

        if (strtolower((string) $venta->estado) === 'pagado') {
            if ((string) ($venta->fulfillment_type ?? 'pickup') === 'delivery' && $venta->jobshours_request_id) {
                JobsHoursDeliveryStatusService::syncVenta($venta);
                $venta->refresh();
            }
            $payload['venta'] = PickupFulfillmentService::ventaToPublicArray($venta);
        }

        return response()->json($payload);
    }

    /**
     * Webhook para Checkout Preferences (MP online).
     * POST /api/pagos/mp-online/webhook
     */
    public function webhook(Request $request)
    {
        $payload = $request->all();

        try {
            if (!$this->validarFirma($request, $payload)) {
                Log::warning('[MP online] Firma inválida');
                return response()->json(['received' => true], 200);
            }
        } catch (\Throwable $e) {
            Log::warning('[MP online] Error validando firma: ' . $e->getMessage());
        }

        $data = $payload['data'] ?? [];

        $externalRef = $data['external_reference']
            ?? ($payload['resource']['external_reference'] ?? null);

        if (empty($externalRef) || !is_string($externalRef)) {
            return response()->json(['received' => true], 200);
        }

        $ventaId = null;
        if (str_starts_with($externalRef, 'venta-')) {
            $ventaId = (int) substr($externalRef, 6);
        } elseif (is_numeric($externalRef)) {
            $ventaId = (int) $externalRef;
        }

        if (!$ventaId || $ventaId <= 0) {
            return response()->json(['received' => true], 200);
        }

        $status = $data['status'] ?? null;
        $paymentId = $data['id'] ?? null;

        // Idempotencia básica: si ya pagó, no volvemos a descontar
        $venta = Venta::find($ventaId);
        if (!$venta) {
            return response()->json(['received' => true], 200);
        }

        $estadoActual = strtolower((string) $venta->estado);
        if ($estadoActual === 'pagado') {
            return response()->json(['received' => true], 200);
        }

        $finalStatus = null;
        if ($status === 'approved') {
            $finalStatus = 'pagado';
        } elseif (in_array($status, ['rejected', 'cancelled', 'refunded'], true)) {
            $finalStatus = 'rechazado';
        }

        if (!$finalStatus) {
            return response()->json(['received' => true], 200);
        }

        DB::transaction(function () use ($venta, $finalStatus, $paymentId) {
            // Confirmar nuevamente dentro de transacción
            $ventaFresh = Venta::find($venta->idventa);
            if (!$ventaFresh) return;
            if (strtolower((string) $ventaFresh->estado) === 'pagado') return;

            if ($finalStatus === 'pagado') {
                CheckoutOrderService::markPaid($ventaFresh, 'mercadopago');
                $ventaFresh->update([
                    'observaciones' => trim(($ventaFresh->observaciones ?? '') . ' | MP payment_id: ' . ($paymentId ?? '')),
                ]);
            } else {
                $ventaFresh->update([
                    'estado' => 'rechazado',
                    'fecha_finalizada' => now(),
                    'observaciones' => trim(($ventaFresh->observaciones ?? '') . ' | MP status: ' . ($finalStatus ?? '')),
                ]);
            }
        });

        return response()->json(['received' => true], 200);
    }

    private function validarFirma(Request $request, array $payload): bool
    {
        $secret = (string) config('services.mercadopago.webhook_secret', '');
        if (empty($secret)) {
            return true; // Sin secret no validamos (MVP)
        }

        $xSignature = (string) $request->header('x-signature');
        $xRequestId = (string) $request->header('x-request-id');
        $dataId = $payload['data']['id'] ?? null;

        if (empty($xSignature) || empty($dataId)) {
            return false;
        }

        $parts = [];
        foreach (explode(',', $xSignature) as $part) {
            $kv = explode('=', trim($part), 2);
            if (count($kv) === 2) {
                $parts[$kv[0]] = $kv[1];
            }
        }
        $ts = $parts['ts'] ?? '';
        $v1 = $parts['v1'] ?? '';

        if ($ts === '' || $v1 === '') {
            return false;
        }

        $idStr = is_string($dataId) ? strtolower($dataId) : (string) $dataId;
        $manifest = 'id:' . $idStr . ';';
        if (!empty($xRequestId)) {
            $manifest .= 'request-id:' . $xRequestId . ';';
        }
        $manifest .= 'ts:' . $ts . ';';

        $expected = hash_hmac('sha256', $manifest, $secret);
        return hash_equals($expected, $v1);
    }

    private function isEnabled(): bool
    {
        return (bool) config('payments.providers.mp_online.enabled', true);
    }
}

