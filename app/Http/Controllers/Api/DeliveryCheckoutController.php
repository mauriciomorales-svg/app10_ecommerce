<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AddressGeocodeService;
use App\Services\DeliveryQuoteService;
use App\Services\RegaloPackDeliveryService;
use Illuminate\Http\Request;

class DeliveryCheckoutController extends Controller
{
    public function quote(Request $request)
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'product_ids' => 'nullable|string|max:500',
        ]);

        $quote = DeliveryQuoteService::quote(
            (float) $validated['lat'],
            (float) $validated['lng']
        );

        $productIds = array_values(array_filter(array_map(
            'intval',
            preg_split('/\s*,\s*/', (string) ($validated['product_ids'] ?? ''), -1, PREG_SPLIT_NO_EMPTY) ?: []
        )));
        if ($productIds !== [] && RegaloPackDeliveryService::productIdsQualifyForFreeDelivery($productIds)) {
            $quote['amount'] = 0;
            $quote['free_regalo_pack'] = true;
            $quote['breakdown'] = array_merge(
                (array) ($quote['breakdown'] ?? []),
                ['label' => 'Envío incluido en pack regalo', 'final_clp' => 0]
            );
        }

        if (! $quote['within_radius']) {
            return response()->json([
                'success' => false,
                'message' => 'La dirección está fuera del radio de envío desde la tienda.',
                'quote' => $quote,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'quote' => $quote,
        ]);
    }

    public function geocode(Request $request)
    {
        $validated = $request->validate([
            'address' => 'required|string|min:5|max:400',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'integer|min:1',
        ]);

        $result = AddressGeocodeService::geocode($validated['address']);
        if (! $result) {
            return response()->json([
                'success' => false,
                'message' => 'No encontramos esa dirección. Prueba con calle y número, o usa tu ubicación en el mapa.',
            ], 404);
        }

        $quote = DeliveryQuoteService::quote($result['lat'], $result['lng']);
        $productIds = array_map('intval', (array) ($validated['product_ids'] ?? []));
        if ($productIds !== [] && RegaloPackDeliveryService::productIdsQualifyForFreeDelivery($productIds)) {
            $quote['amount'] = 0;
            $quote['free_regalo_pack'] = true;
            $quote['breakdown'] = array_merge(
                (array) ($quote['breakdown'] ?? []),
                ['label' => 'Envío incluido en pack regalo', 'final_clp' => 0]
            );
        }

        return response()->json([
            'success' => true,
            'location' => $result,
            'quote' => $quote,
        ]);
    }

    public function config()
    {
        $pricing = config('delivery.pricing');

        return response()->json([
            'success' => true,
            'store' => [
                'name' => config('delivery.store.name'),
                'address' => config('packaging.pickup_address'),
                'lat' => config('delivery.store.lat'),
                'lng' => config('delivery.store.lng'),
            ],
            'pricing' => [
                'base_commune_clp' => (int) ($pricing['base_commune_clp'] ?? 2000),
                'included_km' => (float) ($pricing['included_km'] ?? 3),
                'per_extra_km_clp' => (int) ($pricing['per_extra_km_clp'] ?? 600),
                'max_radius_km' => (float) ($pricing['max_radius_km'] ?? 18),
                'hint' => 'Desde $'.number_format((int) ($pricing['base_commune_clp'] ?? 2000), 0, ',', '.')
                    .' en la misma comuna (hasta '.number_format((float) ($pricing['included_km'] ?? 3), 1, ',', '.').' km)',
            ],
            'renaico' => $this->renaicoMessaging(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function renaicoMessaging(): array
    {
        $cfg = (array) config('delivery_renaico', []);

        return [
            'activo' => (bool) ($cfg['activo'] ?? true),
            'min_pedido_delivery_clp' => (int) ($cfg['min_pedido_delivery_clp'] ?? 12000),
            'min_pedido_delivery_nota' => (string) ($cfg['min_pedido_delivery_nota'] ?? ''),
            'ventanas' => (array) ($cfg['ventanas'] ?? []),
            'retiro' => (array) ($cfg['retiro'] ?? []),
        ];
    }
}
