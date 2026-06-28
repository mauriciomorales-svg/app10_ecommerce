<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class MarketingConfigController extends Controller
{
    public function show()
    {
        $offer = config('marketing.weekly_offer', []);

        return response()->json([
            'success' => true,
            'weekly_offer' => [
                'enabled' => (bool) ($offer['enabled'] ?? false),
                'title' => (string) ($offer['title'] ?? ''),
                'subtitle' => (string) ($offer['subtitle'] ?? ''),
                'href' => (string) ($offer['href'] ?? '/helados'),
                'coupon' => (string) ($offer['coupon'] ?? ''),
                'badge' => (string) ($offer['badge'] ?? ''),
            ],
            'meta_pixel_configured' => trim((string) config('marketing.meta_pixel_id', '')) !== '',
        ]);
    }
}
