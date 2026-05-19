<?php

namespace App\Support;

use App\Services\CheckoutPriceService;
use App\Services\CheckoutTotalsService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CheckoutRequestValidator
{
    /**
     * @return array{
     *   items: array<int, array<string, mixed>>,
     *   cliente: array<string, mixed>,
     *   packaging_key: string,
     *   fulfillment_type: string,
     *   delivery: array<string, mixed>|null,
     *   totals: array<string, mixed>
     * }
     */
    public static function validatePaymentStart(Request $request): array
    {
        $rules = [
            'items' => 'required|array|min:1',
            'cliente' => 'required|array',
            'cliente.nombre' => 'required|string|max:120',
            'cliente.email' => 'required|email',
            'cliente.telefono' => 'required|string|max:32',
            'packaging_key' => 'required|string|in:'.implode(',', array_keys(config('packaging.options', []))),
            'fulfillment_type' => 'required|string|in:pickup,delivery',
            'total' => 'required|numeric|min:1',
        ];

        $fulfillmentPreview = $request->input('fulfillment_type', 'pickup');
        if ($fulfillmentPreview === 'pickup') {
            $rules['cliente.fecha_retiro'] = 'required|date|after_or_equal:today';
        } else {
            $rules['cliente.fecha_retiro'] = 'nullable|date|after_or_equal:today';
            $rules['delivery'] = 'required|array';
            $rules['delivery.address'] = 'required|string|max:500';
            $rules['delivery.lat'] = 'required|numeric|between:-90,90';
            $rules['delivery.lng'] = 'required|numeric|between:-180,180';
            $rules['delivery.amount'] = 'required|integer|min:0';
        }

        $validated = $request->validate($rules);

        $fulfillmentType = $validated['fulfillment_type'];
        $items = CheckoutPriceService::resolveCartItems($validated['items']);
        $delivery = $fulfillmentType === 'delivery' ? $validated['delivery'] : null;

        try {
            $totals = CheckoutTotalsService::compute(
                $items,
                $validated['packaging_key'],
                $fulfillmentType,
                $delivery
            );
        } catch (\InvalidArgumentException $e) {
            throw ValidationException::withMessages([
                'delivery' => [self::messageForCode($e->getMessage())],
            ]);
        }

        if (abs((int) round($validated['total']) - $totals['total']) > 2) {
            throw ValidationException::withMessages([
                'total' => ['El total cambió. Actualiza el checkout e intenta de nuevo.'],
            ]);
        }

        return [
            'items' => $items,
            'cliente' => $validated['cliente'],
            'packaging_key' => $validated['packaging_key'],
            'fulfillment_type' => $fulfillmentType,
            'delivery' => $delivery,
            'totals' => $totals,
        ];
    }

    private static function messageForCode(string $code): string
    {
        return match ($code) {
            'delivery_out_of_radius' => 'La dirección está fuera del radio de envío.',
            default => 'Datos de envío inválidos.',
        };
    }
}
