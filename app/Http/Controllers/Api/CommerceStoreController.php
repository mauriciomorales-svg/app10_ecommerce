<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\CurrentCommerceStore;
use Illuminate\Http\Request;

class CommerceStoreController extends Controller
{
    public function current(Request $request)
    {
        $store = CurrentCommerceStore::get();

        if ($store === null) {
            return response()->json([
                'success' => false,
                'message' => 'Tienda no resuelta.',
            ], 404);
        }

        $settings = is_array($store->settings) ? $store->settings : [];

        return response()->json([
            'success' => true,
            'store' => [
                'id' => $store->id,
                'slug' => $store->slug,
                'name' => $store->name,
                'primary_host' => $store->primary_host,
                'theme' => $settings['theme'] ?? 'default',
                'brand' => $settings['brand'] ?? null,
                'links' => $settings['links'] ?? null,
                'checkout' => $settings['checkout'] ?? null,
                'catalog' => $settings['catalog'] ?? null,
            ],
        ]);
    }
}
