<?php

namespace App\Support;

use Illuminate\Http\Request;

class MarketingAttribution
{
    /**
     * @return array{
     *   utm_source: ?string,
     *   utm_medium: ?string,
     *   utm_campaign: ?string,
     *   referrer: ?string,
     *   landing_path: ?string
     * }
     */
    public static function fromRequest(Request $request): array
    {
        $raw = $request->input('marketing', []);
        if (! is_array($raw)) {
            $raw = [];
        }

        return [
            'utm_source' => self::clean($raw['utm_source'] ?? null, 64),
            'utm_medium' => self::clean($raw['utm_medium'] ?? null, 64),
            'utm_campaign' => self::clean($raw['utm_campaign'] ?? null, 128),
            'referrer' => self::clean($raw['referrer'] ?? null, 512),
            'landing_path' => self::clean($raw['landing_path'] ?? null, 255),
        ];
    }

    /**
     * @param  array<string, mixed>  $attribution
     */
    public static function appendToObservaciones(string $observaciones, array $attribution): string
    {
        $parts = [];
        if (! empty($attribution['utm_source'])) {
            $parts[] = 'utm_source=' . $attribution['utm_source'];
        }
        if (! empty($attribution['utm_medium'])) {
            $parts[] = 'utm_medium=' . $attribution['utm_medium'];
        }
        if (! empty($attribution['utm_campaign'])) {
            $parts[] = 'utm_campaign=' . $attribution['utm_campaign'];
        }
        if (! empty($attribution['landing_path'])) {
            $parts[] = 'landing=' . $attribution['landing_path'];
        }

        if ($parts === []) {
            return $observaciones;
        }

        return trim($observaciones . ' | Atribución: ' . implode(', ', $parts));
    }

    private static function clean(mixed $value, int $max): ?string
    {
        if (! is_string($value) && ! is_numeric($value)) {
            return null;
        }

        $text = trim((string) $value);
        if ($text === '') {
            return null;
        }

        return substr($text, 0, $max);
    }
}
