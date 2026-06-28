<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CheckoutOrderService;
use App\Services\CheckoutPriceService;
use App\Services\CheckoutTotalsService;
use App\Services\RegaloPackDeliveryService;
use App\Services\PackagingService;
use App\Services\ValeDescuentoService;
use App\Support\CommerceStoreSettings;
use Illuminate\Http\Request;

class CheckoutOptionsController extends Controller
{
    public function index(Request $request)
    {
        $subtotal = (int) $request->query('subtotal', 0);
        $checkout = CommerceStoreSettings::checkout();
        $brand = (array) (CommerceStoreSettings::get()['brand'] ?? []);
        $packagingOptions = PackagingService::publicOptionsForStore($subtotal);
        $defaultPackaging = (string) ($checkout['packaging_default'] ?? 'standard');
        if (! isset(CommerceStoreSettings::packagingOptions()[$defaultPackaging])) {
            $defaultPackaging = array_key_first(CommerceStoreSettings::packagingOptions()) ?: 'standard';
        }

        return response()->json([
            'success' => true,
            'pickup' => [
                'address' => config('packaging.pickup_address'),
                'hours' => config('packaging.pickup_hours'),
                'whatsapp' => (string) ($brand['whatsapp'] ?? config('packaging.whatsapp')),
                'label' => $checkout['pickup_label'] ?? null,
                'hint' => $checkout['pickup_hint'] ?? null,
            ],
            'thresholds' => [
                'free_reinforced_from' => (int) config('packaging.free_reinforced_from', 10000),
                'free_gift_box_from' => (int) config('packaging.free_gift_box_from', 25000),
            ],
            'packaging_options' => $packagingOptions,
            'packaging_default' => $defaultPackaging,
            'delivery_enabled' => (bool) ($checkout['delivery_enabled'] ?? true),
            'fulfillment_mode' => $checkout['fulfillment_mode'] ?? 'retail',
            'fecha_retiro_label' => $checkout['fecha_retiro_label'] ?? null,
            'min_order_products' => (int) ($checkout['min_order_products'] ?? config('commerce.min_order_products', 0)),
        ]);
    }

    public function preview(Request $request)
    {
        $packagingKeys = CommerceStoreSettings::packagingKeys();
        if ($packagingKeys === []) {
            $packagingKeys = array_keys(config('packaging.options', []));
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'packaging_key' => 'required|string|in:'.implode(',', $packagingKeys),
            'coupon_code' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:120',
            'telefono' => 'nullable|string|max:32',
            'fulfillment_type' => 'nullable|string|in:pickup,delivery',
            'delivery' => 'nullable|array',
            'delivery.lat' => 'required_with:fulfillment_type,delivery|numeric|between:-90,90',
            'delivery.lng' => 'required_with:fulfillment_type,delivery|numeric|between:-180,180',
        ]);

        $fulfillmentType = $validated['fulfillment_type'] ?? 'pickup';
        $items = CheckoutPriceService::resolveCartItems($validated['items']);
        $delivery = $fulfillmentType === 'delivery' ? ($validated['delivery'] ?? null) : null;

        $couponDiscount = 0;
        if (! empty($validated['coupon_code'])) {
            $coupon = ValeDescuentoService::validate(
                $validated['coupon_code'],
                (int) CheckoutPriceService::sumResolved($items),
                $validated['email'] ?? null,
                $validated['telefono'] ?? null
            );
            if ($coupon['valid'] ?? false) {
                $couponDiscount = (int) ($coupon['discount'] ?? 0);
            }
        }

        try {
            $totals = CheckoutTotalsService::compute(
                $items,
                $validated['packaging_key'],
                $fulfillmentType,
                $delivery,
                $couponDiscount
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
            'delivery_paid_via_jobshours' => ! RegaloPackDeliveryService::resolvedItemsQualifyForFreeDelivery($items),
            'delivery_free_regalo_pack' => RegaloPackDeliveryService::resolvedItemsQualifyForFreeDelivery($items),
            'amount_to_free_reinforced' => max(0, (int) config('packaging.free_reinforced_from', 10000) - $subtotal),
            'amount_to_free_gift_box' => max(0, (int) config('packaging.free_gift_box_from', 25000) - $subtotal),
            'coupon_discount' => (int) ($totals['coupon_discount'] ?? 0),
        ]);
    }
}
