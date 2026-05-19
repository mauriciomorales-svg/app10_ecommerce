<?php

namespace App\Http\Middleware;

use App\Models\CommerceStore;
use App\Support\CurrentCommerceStore;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class AssignCommerceStore
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Schema::hasTable('commerce_stores')) {
            return $next($request);
        }

        try {
            CurrentCommerceStore::set(CommerceStore::resolveFromRequest($request));
        } catch (\Throwable) {
            CurrentCommerceStore::forget();

            return response()->json([
                'message' => 'Tienda de comercio no configurada. Ejecutá migraciones y creá la fila en commerce_stores (slug default).',
            ], 503);
        }

        return $next($request);
    }
}
