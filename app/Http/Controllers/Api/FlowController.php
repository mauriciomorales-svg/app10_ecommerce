<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FlowController extends Controller
{
    public function iniciar(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'cliente' => 'required|array',
            'total' => 'required|numeric|min:1',
        ]);

        $items = $request->items;
        $cliente = $request->cliente;
        $total = $request->total;

        $numVenta = (int) (time() % 100000000);
        $venta = Venta::create([
            'numero_venta' => $numVenta,
            'fecha' => now(),
            'total' => $total,
            'subtotal' => $total,
            'descuento' => 0,
            'medio_pago' => 'flow',
            'estado' => 'pendiente',
            'observaciones' => 'Pago online - ' . ($cliente['nombre'] ?? '') . ' - ' . ($cliente['email'] ?? ''),
        ]);

        foreach ($items as $item) {
            $insertData = [
                'idventa' => $venta->idventa,
                'idproducto' => $item['idproducto'],
                'cantidad' => $item['cantidad'],
                'precio_unitario' => $item['precio_venta'],
                'subtotal' => $item['precio_venta'] * $item['cantidad'],
            ];
            if (!empty($item['bundle_configuration'])) {
                $insertData['bundle_configuration'] = json_encode($item['bundle_configuration']);
            }
            DB::table('detalle_venta')->insert($insertData);
        }

        $flowApiKey = config('services.flow.api_key', '');
        $flowSecret = config('services.flow.secret_key', '');
        $flowEndpoint = config('services.flow.sandbox', false)
            ? 'https://sandbox.flow.cl/api'
            : 'https://www.flow.cl/api';

        $orderData = [
            'apiKey' => $flowApiKey,
            'commerceOrder' => 'FLOW-' . $venta->idventa,
            'subject' => 'Compra DondeMorales - San Valentin',
            'currency' => 'CLP',
            'amount' => (int) round($total),
            'email' => $cliente['email'],
            'paymentMethod' => 9,
            'urlConfirmation' => 'https://www.dondemorales.cl/api/pagos/flow/confirm',
            'urlReturn' => 'https://www.dondemorales.cl/api/pagos/flow/return',
        ];

        $orderData['s'] = $this->sign($orderData, $flowSecret);

        try {
            $response = $this->send($flowEndpoint . '/payment/create', $orderData);
            \Log::info('Flow response: ' . $response);
            \Log::info('Flow endpoint: ' . $flowEndpoint);
            \Log::info('Flow orderData: ' . json_encode($orderData));
            $result = json_decode($response, true);

            if (isset($result['url']) && isset($result['token'])) {
                return response()->json([
                    'success' => true,
                    'url' => $result['url'],
                    'token' => $result['token'],
                    'order' => $venta->num_comprobante,
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

        $flowSecret = config('services.flow.secret_key', '');
        $flowEndpoint = config('services.flow.sandbox', false)
            ? 'https://sandbox.flow.cl/api'
            : 'https://www.flow.cl/api';

        $params = [
            'apiKey' => config('services.flow.api_key', ''),
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
                        $venta->update(['estado' => 'pagado', 'medio_pago' => 'flow', 'fecha_finalizada' => now()]);
                        InventoryService::deductStockForVenta($venta->idventa);
                    } elseif ($status == 3 || $status == 4) {
                        $venta->update(['estado' => 'Rechazado']);
                    }

                    return response()->json([
                        'success' => $status == 2,
                        'status' => $status,
                        'venta' => $venta,
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
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
    }

    private function sendGet($url, $params)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($params));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
    }
}
