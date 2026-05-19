<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CheckoutOrderService;
use App\Services\CheckoutPriceService;
use App\Services\CheckoutTotalsService;
use App\Services\PackagingService;
use Illuminate\Http\Request;

class CheckoutOptionsController extends Controller
{
    public function index(Request $request)
    {
        $subtotal = (int) $request->query('subtotal', 0);

        return response()->json([
            'success' => true,
            'pickup' => [
                'address' => config('packaging.pickup_address'),
                'hours' => config('packaging.pickup_hours'),
                'whatsapp' => config('packaging.whatsapp'),
            ],
            'thresholds' => [
                'free_reinforced_from' => (int) config('packaging.free_reinforced_from', 10000),
                'free_gift_box_from' => (int) config('packaging.free_gift_box_from', 25000),
            ],
            'packaging_options' => PackagingService::publicOptions($subtotal),
            'delivery_enabled' => true,
        ]);
    }

    public function preview(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'packaging_key' => 'required|string|in:'.implode(',', array_keys(config('packaging.options', []))),
            'fulfillment_type' => 'nullable|string|in:pickup,delivery',
            'delivery' => 'nullable|array',
            'delivery.lat' => 'required_with:fulfillment_type,delivery|numeric|between:-90,90',
            'delivery.lng' => 'required_with:fulfillment_type,delivery|numeric|between:-180,180',
        ]);

        $fulfillmentType = $validated['fulfillment_type'] ?? 'pickup';
        $items = CheckoutPriceService::resolveCartItems($validated['items']);
        $delivery = $fulfillmentType === 'delivery' ? ($validated['delivery'] ?? null) : null;

        try {
            $totals = CheckoutTotalsService::compute(
                $items,
                $validated['packaging_key'],
                $fulfillmentType,
                $delivery
            );
        } catch (\InvalidArgumentException) {
            return response()->json([
                'success' => false,
                'message' => 'Envío no disponible para esa ubicación.',
            ], 422);
        }

        $subtotal = (int) $totals['subtotal_productos'];

        return response()->json([
            'success' => true,
            'subtotal_productos' => $subtotal,
            'packaging' => $totals['packaging'],
            'delivery' => $totals['delivery'],
            'delivery_amount' => (int) ($totals['delivery_amount'] ?? 0),
            'fulfillment_type' => $fulfillmentType,
            'store_total' => (int) ($totals['store_total'] ?? $totals['total']),
            'total' => (int) $totals['total'],
            'delivery_paid_via_jobshours' => true,
            'amount_to_free_reinforced' => max(0, (int) config('packaging.free_reinforced_from', 10000) - $subtotal),
        ]);
    }
}
