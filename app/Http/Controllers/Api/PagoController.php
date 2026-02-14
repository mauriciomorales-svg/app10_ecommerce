<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PagoController extends Controller
{

    public function iniciarPago(Request $request)
    {
        $request->validate(['idventa' => 'required|exists:venta,idventa']);
        
        $venta = Venta::findOrFail($request->idventa);
        
        $response = (new Transaction)->create(
            $venta->num_comprobante, // Orden de compra
            $venta->idventa,         // Sesión
            $venta->total_venta,     // Monto
            route('webpay.callback') // URL de retorno
        );
        
        return response()->json([
            'url' => $response->getUrl(),
            'token' => $response->getToken(),
        ]);
    }

    public function callback(Request $request)
    {
        $token = $request->get('token_ws');
        
        if (!$token) {
            return response()->json(['error' => 'Pago cancelado o rechazado'], 400);
        }
        
        $response = (new Transaction)->commit($token);
        
        if ($response->isApproved()) {
            $venta = Venta::where('num_comprobante', $response->getBuyOrder())->first();
            if ($venta) {
                $venta->update([
                    'tipo_pago' => 'webpay',
                    'estado' => 'activo',
                ]);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Pago aprobado',
                'venta' => $venta,
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Pago rechazado',
            'response' => $response,
        ], 400);
    }

    public function status($token)
    {
        $response = (new Transaction)->status($token);
        return response()->json($response);
    }

    // ==========================================
    // FLOW - Pasarela de pagos alternativa
    // ==========================================
    
    public function iniciarFlow(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'cliente' => 'required|array',
            'total' => 'required|numeric|min:1',
        ]);

        $items = $request->items;
        $cliente = $request->cliente;
        $total = $request->total;

        // Crear venta en la base de datos
        $venta = Venta::create([
            'idcliente' => null,
            'tipo_comprobante' => 'Boleta',
            'num_comprobante' => 'VNT-' . time(),
            'fecha_hora' => now(),
            'total_venta' => $total,
            'tipo_pago' => 'flow',
            'estado' => 'Pendiente',
        ]);

        // Crear detalles de la venta
        foreach ($items as $item) {
            DB::table('detalle_venta')->insert([
                'idventa' => $venta->idventa,
                'idproducto' => $item['idproducto'],
                'cantidad' => $item['cantidad'],
                'precio_venta' => $item['precio_venta'],
                'descuento' => 0,
            ]);
        }

        // Preparar datos para Flow
        $flowApiKey = config('services.flow.api_key', '');
        $flowSecret = config('services.flow.secret_key', '');
        $flowEndpoint = config('services.flow.sandbox', true) 
            ? 'https://sandbox.flow.cl/api'
            : 'https://www.flow.cl/api';

        $orderData = [
            'apiKey' => $flowApiKey,
            'commerceOrder' => $venta->num_comprobante,
            'subject' => 'Compra DondeMorales - San Valentin',
            'currency' => 'CLP',
            'amount' => round($total),
            'email' => $cliente['email'],
            'paymentMethod' => 9, // Todos los métodos
            'urlConfirmation' => route('flow.confirm'),
            'urlReturn' => route('flow.return'),
        ];

        // Generar firma
        $orderData['s'] = $this->flowSign($orderData, $flowSecret);

        try {
            $response = $this->flowSend($flowEndpoint . '/payment/create', $orderData);
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
                'message' => 'Error al crear pago Flow',
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

    public function confirmFlow(Request $request)
    {
        $token = $request->get('token');
        
        if (!$token) {
            return response()->json(['error' => 'Token no recibido'], 400);
        }

        // Consultar estado del pago
        $flowSecret = config('services.flow.secret_key', '');
        $flowEndpoint = config('services.flow.sandbox', true) 
            ? 'https://sandbox.flow.cl/api'
            : 'https://www.flow.cl/api';

        $params = [
            'token' => $token,
            'apiKey' => config('services.flow.api_key', ''),
        ];
        $params['s'] = $this->flowSign($params, $flowSecret);

        try {
            $response = $this->flowSend($flowEndpoint . '/payment/getStatus', $params);
            $result = json_decode($response, true);

            if (isset($result['commerceOrder'])) {
                $venta = Venta::where('num_comprobante', $result['commerceOrder'])->first();
                
                if ($venta) {
                    $status = $result['status'] ?? 0;
                    
                    // 2 = pagado, 3 = rechazado, 4 = anulado
                    if ($status == 2) {
                        $venta->update([
                            'estado' => 'Pagado',
                            'tipo_pago' => 'flow_paid',
                        ]);
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

            return response()->json([
                'success' => false,
                'result' => $result,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function returnFlow(Request $request)
    {
        $token = $request->get('token');
        
        // Redirigir al frontend con el token
        $frontendUrl = env('FRONTEND_URL', 'https://www.dondemorales.cl');
        return redirect($frontendUrl . '/pago/resultado?token=' . $token . '&status=return');
    }

    private function flowSign($params, $secret)
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

    private function flowSend($url, $params)
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
}
