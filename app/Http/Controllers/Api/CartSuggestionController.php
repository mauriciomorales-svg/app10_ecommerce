<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartSuggestionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CartSuggestionController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'product_ids' => 'required|array|min:1',
            'product_ids.*' => 'integer|min:1',
        ]);

        $ids = array_values(array_unique(array_map('intval', $validated['product_ids'])));
        sort($ids);
        $cacheKey = 'cart_suggestions:'.md5(implode(',', $ids));
        $ttl = (int) config('cart_suggestions.cache_seconds', 60);

        $suggestions = Cache::remember($cacheKey, $ttl, fn () => CartSuggestionService::forCart($ids));

        return response()->json([
            'success' => true,
            'suggestions' => $suggestions,
        ]);
    }
}
