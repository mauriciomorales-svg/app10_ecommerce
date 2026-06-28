<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartSuggestionService;
use App\Support\CurrentCommerceStore;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProductSuggestionController extends Controller
{
    public function index($productoId)
    {
        $productoId = (int) $productoId;
        $storeId = CurrentCommerceStore::id();

        $originQ = DB::table('productos')->where('idproducto', $productoId);
        if ($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id')) {
            $originQ->where('commerce_store_id', $storeId);
        }
        if (! $originQ->exists()) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json(CartSuggestionService::forProduct($productoId));
    }
}
