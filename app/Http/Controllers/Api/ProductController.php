<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()->active()->with('category');

        if ($request->has('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->has('search')) {
            $query->where('name', 'ilike', '%' . $request->search . '%');
        }

        if ($request->has('featured')) {
            $query->featured();
        }

        $products = $query->paginate(12);
        return response()->json($products);
    }

    public function show($slug)
    {
        $product = Product::active()->where('slug', $slug)->firstOrFail();
        return response()->json($product);
    }

    public function featured()
    {
        $products = Product::active()->featured()->take(8)->get();
        return response()->json($products);
    }
}
