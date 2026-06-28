<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Services\CheckoutOrderService;
use App\Services\JobsHoursDeliveryStatusService;
use App\Services\PickupFulfillmentService;
use App\Support\CheckoutRequestValidator;
use Illuminate\Http\Request;

class FlowController extends Controller
{
    public function iniciar(Request $request)
    {
        if (!$this->isEnabled()) {
            return response()->json([
                'success' => false,
                'message' => 'Flow está deshabilitado temporalmente',
                'code' => 'PAYMENT_PROVIDER_DISABLED',
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
            'flow',
            $checkout['fulfillment_type'],
            $checkout['delivery'],
            $checkout['totals'],
            $checkout['coupon_code'] ?? null,
            (int) ($checkout['coupon_discount'] ?? 0),
            $checkout['marketing'] ?? []
        );
        $total = (int) round((float) $venta->total);

        $flowApiKey = trim((string) config('services.flow.api_key', ''));
        $flowSecret = trim((string) config('services.flow.secret_key', ''));
        $flowEndpoint = config('services.flow.sandbox', false)
            ? 'https://sandbox.flow.cl/api'
            : 'https://www.flow.cl/api';
        $backendUrl = rtrim(config('app.url', 'https://dondemorales.cl'), '/');

        if (empty($flowApiKey) || empty($flowSecret)) {
            return response()->json([
                'success' => false,
                'message' => 'Flow no configurado en servidor',
                'error' => 'Faltan FLOW_API_KEY y/o FLOW_SECRET_KEY en entorno de producción',
            ], 503);
        }

        $orderData = [
            'apiKey' => $flowApiKey,
            'commerceOrder' => 'FLOW-' . $venta->idventa,
            'subject' => 'DondeMorales — Pedido #'.$venta->idventa,
            'currency' => 'CLP',
            'amount' => (int) round($total),
            'email' => $cliente['email'],
            'paymentMethod' => 9,
            'urlConfirmation' => $backendUrl . '/api/pagos/flow/confirm',
            'urlReturn' => $backendUrl . '/api/pagos/flow/return',
        ];

        $orderData['s'] = $this->sign($orderData, $flowSecret);

        try {
            $response = $this->send($flowEndpoint . '/payment/create', $orderData);
            \Log::info('Flow payment/create', [
                'endpoint' => $flowEndpoint,
                'venta_id' => $venta->idventa,
                'amount' => $total,
            ]);
            $result = json_decode($response, true);

            if (isset($result['url']) && isset($result['token'])) {
                return response()->json([
                    'success' => true,
                    'url' => $result['url'],
                    'token' => $result['token'],
                    'venta_id' => $venta->idventa,
                    'total' => $total,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error al crear pago en Flow',
                'error' => $result,
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de conexión con Flow',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function confirm(Request $request)
    {
        $token = $request->get('token');

        \Log::info('Flow confirm token: ' . $token);
        \Log::info('Flow confirm all: ' . json_encode($request->all()));

        if (!$token) {
            return response()->json(['error' => 'Token no recibido'], 400);
        }

        $flowSecret = trim((string) config('services.flow.secret_key', ''));
        $flowEndpoint = config('services.flow.sandbox', false)
            ? 'https://sandbox.flow.cl/api'
            : 'https://www.flow.cl/api';

        $params = [
            'apiKey' => trim((string) config('services.flow.api_key', '')),
            'token' => $token,
        ];
        $params['s'] = $this->sign($params, $flowSecret);

        try {
            $response = $this->sendGet($flowEndpoint . '/payment/getStatus', $params);
            \Log::info('Flow getStatus response: ' . $response);
            $result = json_decode($response, true);

            if (isset($result['commerceOrder'])) {
                $idventa = str_replace('FLOW-', '', $result['commerceOrder']);
                $venta = Venta::find($idventa);

                if ($venta) {
                    $status = $result['status'] ?? 0;

                    if ($status == 2) {
                        $venta = CheckoutOrderService::markPaid($venta, 'flow');
                    } elseif ($status == 3 || $status == 4) {
                        $venta->update(['estado' => 'rechazado']);
                    }

                    $venta = $venta->fresh();
                    if (
                        $status == 2
                        && (string) ($venta->fulfillment_type ?? 'pickup') === 'delivery'
                        && $venta->jobshours_request_id
                    ) {
                        JobsHoursDeliveryStatusService::syncVenta($venta);
                        $venta->refresh();
                    }

                    return response()->json([
                        'success' => $status == 2,
                        'status' => $status,
                        'venta' => PickupFulfillmentService::ventaToPublicArray($venta),
                    ]);
                }
            }

            return response()->json(['success' => false, 'result' => $result]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function retorno(Request $request)
    {
        $token = $request->input('token');
        \Log::info('Flow retorno token: ' . $token);
        \Log::info('Flow retorno all: ' . json_encode($request->all()));
        $frontendUrl = env('FRONTEND_URL', 'https://www.dondemorales.cl');
        return redirect($frontendUrl . '/pago/resultado?token=' . $token . '&status=return');
    }

    private function sign($params, $secret)
    {
        ksort($params);
        $toSign = '';
        foreach ($params as $key => $value) {
            if ($key !== 's') {
                $toSign .= $key . $value;
            }
        }
        return hash_hmac('sha256', $toSign, $secret);
    }

    private function send($url, $params)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        $response = curl_exec($ch);
        if ($response === false) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new \RuntimeException('Flow cURL error: ' . $error);
        }
        curl_close($ch);
        return $response;
    }

    private function sendGet($url, $params)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        $response = curl_exec($ch);
        if ($response === false) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new \RuntimeException('Flow cURL error: ' . $error);
        }
        curl_close($ch);
        return $response;
    }

    private function isEnabled(): bool
    {
        return (bool) config('payments.providers.flow.enabled', true);
    }
}
