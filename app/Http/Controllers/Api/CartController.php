<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = CartItem::where('session_id', $request->session()->getId())
            ->orWhere('user_id', auth()->id())
            ->with('product')
            ->get();
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $request->validate(['product_id' => 'required|exists:products,id', 'quantity' => 'integer|min:1']);
        $product = Product::findOrFail($request->product_id);
        
        $item = CartItem::updateOrCreate(
            [
                'session_id' => $request->session()->getId(),
                'product_id' => $request->product_id,
            ],
            [
                'user_id' => auth()->id(),
                'quantity' => $request->quantity ?? 1,
                'price' => $product->price,
                'attributes' => $request->attributes ?? [],
            ]
        );
        return response()->json($item);
    }

    public function destroy($id)
    {
        CartItem::findOrFail($id)->delete();
        return response()->json(['message' => 'Item removed']);
    }
}
