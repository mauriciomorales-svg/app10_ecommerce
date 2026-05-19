<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LegacyPosVentasApiEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('commerce.legacy_pos_ventas_api', false)) {
            return response()->json([
                'success' => false,
                'message' => 'Endpoint deshabilitado. Usa el checkout web con pago.',
            ], 410);
        }

        return $next($request);
    }
}
