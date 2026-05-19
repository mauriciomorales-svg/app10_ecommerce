<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AddressGeocodeService
{
    /**
     * @return array{lat: float, lng: float, display_name: string}|null
     */
    public static function geocode(string $address): ?array
    {
        if (! config('delivery.geocode.enabled')) {
            return null;
        }

        $address = trim($address);
        if ($address === '') {
            return null;
        }

        $city = (string) config('delivery.geocode.default_city', 'Renaico, Chile');
        $query = str_contains(mb_strtolower($address), 'renaico')
            ? $address
            : $address.', '.$city;

        try {
            $response = Http::timeout(12)
                ->withHeaders([
                    'User-Agent' => (string) config('delivery.geocode.user_agent'),
                    'Accept' => 'application/json',
                ])
                ->get((string) config('delivery.geocode.nominatim_url'), [
                    'q' => $query,
                    'format' => 'json',
                    'limit' => 1,
                    'countrycodes' => 'cl',
                ]);

            if (! $response->successful()) {
                return null;
            }

            $rows = $response->json();
            if (! is_array($rows) || $rows === []) {
                return null;
            }

            $first = $rows[0];
            $lat = (float) ($first['lat'] ?? 0);
            $lng = (float) ($first['lon'] ?? $first['lng'] ?? 0);

            if ($lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
                return null;
            }

            return [
                'lat' => $lat,
                'lng' => $lng,
                'display_name' => (string) ($first['display_name'] ?? $query),
            ];
        } catch (\Throwable $e) {
            Log::warning('geocode.failed', ['message' => $e->getMessage()]);

            return null;
        }
    }
}
