<?php

namespace App\Services;

class CheckoutTotalsService
{
    /**
     * @param  array<int, array<string, mixed>>  $resolvedItems
     * @param  array<string, mixed>|null  $delivery
     * @return array{
     *   subtotal_productos: int,
     *   packaging: array<string, mixed>,
     *   delivery: array<string, mixed>|null,
     *   delivery_amount: int,
     *   store_total: int,
     *   total: int
     * }
     */
    public static function compute(
        array $resolvedItems,
        string $packagingKey,
        string $fulfillmentType = 'pickup',
        ?array $delivery = null,
        int $couponDiscount = 0
    ): array {
        $subtotal = CheckoutPriceService::sumResolved($resolvedItems);
        $packaging = PackagingService::resolve($packagingKey, $subtotal);

        $deliveryQuote = null;
        $deliveryAmount = 0;

        if ($fulfillmentType === 'delivery' && is_array($delivery)) {
            $lat = (float) ($delivery['lat'] ?? 0);
            $lng = (float) ($delivery['lng'] ?? 0);
            $deliveryQuote = DeliveryQuoteService::quote($lat, $lng);
            if (! $deliveryQuote['within_radius']) {
                throw new \InvalidArgumentException('delivery_out_of_radius');
            }
            $deliveryAmount = (int) $deliveryQuote['amount'];
            if (RegaloPackDeliveryService::resolvedItemsQualifyForFreeDelivery($resolvedItems)) {
                $deliveryAmount = 0;
                $deliveryQuote['amount'] = 0;
                $deliveryQuote['free_regalo_pack'] = true;
                $deliveryQuote['breakdown'] = array_merge(
                    (array) ($deliveryQuote['breakdown'] ?? []),
                    ['label' => 'Envío incluido en pack regalo', 'final_clp' => 0]
                );
            }
        }

        $discount = max(0, min($couponDiscount, $subtotal + (int) $packaging['amount']));
        $storeTotal = max(0, $subtotal + (int) $packaging['amount'] - $discount);

        return [
            'subtotal_productos' => $subtotal,
            'packaging' => $packaging,
            'delivery' => $deliveryQuote,
            'delivery_amount' => $deliveryAmount,
            'coupon_discount' => $discount,
            'store_total' => $storeTotal,
            // Total a cobrar en DondeMorales (sin envío; el cliente paga el mandado en JobsHours).
            'total' => $storeTotal,
        ];
    }
}
