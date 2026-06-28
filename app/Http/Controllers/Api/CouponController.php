<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ValeDescuentoService;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:50',
            'subtotal' => 'required|integer|min:0',
            'email' => 'nullable|email|max:120',
            'telefono' => 'nullable|string|max:32',
        ]);

        $result = ValeDescuentoService::validate(
            $validated['codigo'],
            (int) $validated['subtotal'],
            $validated['email'] ?? null,
            $validated['telefono'] ?? null
        );

        if (! ($result['valid'] ?? false)) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Cupón no válido',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'codigo' => $result['codigo'],
            'discount' => $result['discount'],
            'label' => $result['label'],
        ]);
    }
}
