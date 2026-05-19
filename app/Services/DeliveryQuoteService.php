<?php

namespace App\Services;

class DeliveryQuoteService
{
    public static function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earth = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earth * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    /**
     * @return array{
     *   amount: int,
     *   distance_km: float,
     *   distance_km_adjusted: float,
     *   breakdown: array<string, mixed>,
     *   within_radius: bool
     * }
     */
    public static function quote(float $destLat, float $destLng): array
    {
        $storeLat = (float) config('delivery.store.lat');
        $storeLng = (float) config('delivery.store.lng');
        $pricing = config('delivery.pricing');

        $rawKm = self::haversineKm($storeLat, $storeLng, $destLat, $destLng);
        $factor = (float) ($pricing['road_factor'] ?? 1.15);
        $adjKm = round($rawKm * $factor, 2);

        $maxRadius = (float) ($pricing['max_radius_km'] ?? 18);
        $within = $adjKm <= $maxRadius;

        $amount = $within ? self::priceFromAdjustedKm($adjKm) : 0;

        return [
            'amount' => $amount,
            'distance_km' => round($rawKm, 2),
            'distance_km_adjusted' => $adjKm,
            'within_radius' => $within,
            'max_radius_km' => $maxRadius,
            'breakdown' => self::breakdown($adjKm, $amount),
            'store' => [
                'lat' => $storeLat,
                'lng' => $storeLng,
                'name' => config('delivery.store.name'),
                'address' => config('packaging.pickup_address'),
            ],
        ];
    }

    public static function priceFromAdjustedKm(float $adjKm): int
    {
        $pricing = config('delivery.pricing');
        $base = (int) ($pricing['base_commune_clp'] ?? 2000);
        $included = (float) ($pricing['included_km'] ?? 3);
        $perExtra = (int) ($pricing['per_extra_km_clp'] ?? 600);
        $min = (int) ($pricing['min_clp'] ?? 2000);
        $max = (int) ($pricing['max_clp'] ?? 12000);
        $roundTo = max(1, (int) ($pricing['round_to'] ?? 100));

        if ($adjKm <= $included) {
            $price = $base;
        } else {
            $extraKm = (int) ceil($adjKm - $included);
            $price = $base + ($extraKm * $perExtra);
        }

        $price = (int) (round($price / $roundTo) * $roundTo);
        $price = max($min, min($max, $price));

        return $price;
    }

    /**
     * @return array<string, mixed>
     */
    private static function breakdown(float $adjKm, int $amount): array
    {
        $pricing = config('delivery.pricing');
        $included = (float) ($pricing['included_km'] ?? 3);

        return [
            'label' => $adjKm <= $included
                ? 'Tarifa comuna (hasta '.number_format($included, 1, ',', '.').' km)'
                : 'Tarifa base + km adicionales',
            'base_commune_clp' => (int) ($pricing['base_commune_clp'] ?? 2000),
            'included_km' => $included,
            'per_extra_km_clp' => (int) ($pricing['per_extra_km_clp'] ?? 600),
            'final_clp' => $amount,
        ];
    }

    /**
     * @param  array<string, mixed>  $delivery  lat, lng, address
     */
    public static function assertQuoteMatches(string $fulfillmentType, array $delivery, int $expectedDeliveryAmount): void
    {
        if ($fulfillmentType !== 'delivery') {
            if ($expectedDeliveryAmount !== 0) {
                throw new \InvalidArgumentException('delivery_amount_invalid');
            }

            return;
        }

        $lat = (float) ($delivery['lat'] ?? 0);
        $lng = (float) ($delivery['lng'] ?? 0);
        if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            throw new \InvalidArgumentException('delivery_coords_invalid');
        }

        $quote = self::quote($lat, $lng);
        if (! $quote['within_radius']) {
            throw new \InvalidArgumentException('delivery_out_of_radius');
        }

        if (abs($quote['amount'] - $expectedDeliveryAmount) > 2) {
            throw new \InvalidArgumentException('delivery_amount_mismatch');
        }
    }
}
