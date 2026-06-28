<?php

namespace App\Support;

class CustomizationFieldOptions
{
    /**
     * @param  array<string, mixed>|list<string>|null  $raw
     * @return array{values: list<string>}|null
     */
    public static function normalizeForStorage(?array $raw): ?array
    {
        if ($raw === null || $raw === []) {
            return null;
        }

        if (isset($raw['values']) && is_array($raw['values'])) {
            $values = array_values(array_filter(array_map(
                fn ($v) => trim((string) $v),
                $raw['values']
            ), fn ($v) => $v !== ''));

            return $values === [] ? null : ['values' => $values];
        }

        if (array_is_list($raw)) {
            $values = array_values(array_filter(array_map(
                fn ($v) => trim((string) $v),
                $raw
            ), fn ($v) => $v !== ''));

            return $values === [] ? null : ['values' => $values];
        }

        return $raw;
    }

    /**
     * @param  array<string, mixed>|list<string>|null  $raw
     * @return list<string>
     */
    public static function valuesForFrontend(mixed $raw): array
    {
        if ($raw === null) {
            return [];
        }

        if (is_string($raw)) {
            $decoded = json_decode($raw, true);

            return is_array($decoded) ? self::valuesForFrontend($decoded) : [];
        }

        if (! is_array($raw)) {
            return [];
        }

        $normalized = self::normalizeForStorage($raw);

        return $normalized['values'] ?? [];
    }

    public static function fromLines(string $lines): ?array
    {
        $values = array_values(array_filter(array_map(
            'trim',
            preg_split('/\r\n|\r|\n/', $lines) ?: []
        ), fn ($v) => $v !== ''));

        return $values === [] ? null : ['values' => $values];
    }

    /**
     * @param  array<string, mixed>|list<string>|null  $raw
     */
    public static function toLines(mixed $raw): string
    {
        return implode("\n", self::valuesForFrontend($raw));
    }
}
