<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AddressGeocodeService;
use App\Services\DeliveryQuoteService;
use Illuminate\Http\Request;

class DeliveryCheckoutController extends Controller
{
    public function quote(Request $request)
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $quote = DeliveryQuoteService::quote(
            (float) $validated['lat'],
            (float) $validated['lng']
        );

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
        ]);

        $result = AddressGeocodeService::geocode($validated['address']);
        if (! $result) {
            return response()->json([
                'success' => false,
                'message' => 'No encontramos esa dirección. Prueba con calle y número, o usa tu ubicación en el mapa.',
            ], 404);
        }

        $quote = DeliveryQuoteService::quote($result['lat'], $result['lng']);

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
        ]);
    }
}
