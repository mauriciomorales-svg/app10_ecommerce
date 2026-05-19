<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Services\JobsHoursDeliveryStatusService;
use App\Services\PickupFulfillmentService;
use Illuminate\Http\Request;

class OrderTrackingController extends Controller
{
    /**
     * GET /api/ordenes/{id}/seguimiento?expires=&sig=
     */
    public function show(Request $request, int $id)
    {
        $venta = Venta::find($id);

        if (! $venta || strtolower((string) $venta->estado) !== 'pagado') {
            return response()->json([
                'success' => false,
                'message' => 'Pedido no encontrado',
            ], 404);
        }

        if (
            (string) ($venta->fulfillment_type ?? 'pickup') === 'delivery'
            && $venta->jobshours_request_id
        ) {
            JobsHoursDeliveryStatusService::syncVenta($venta);
            $venta->refresh();
        }

        return response()->json([
            'success' => true,
            'venta' => PickupFulfillmentService::ventaToPublicArray($venta),
        ]);
    }
}
