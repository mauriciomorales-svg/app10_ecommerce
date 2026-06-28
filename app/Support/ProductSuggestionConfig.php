<?php

namespace App\Support;

use App\Models\Configuracion;
use Illuminate\Support\Facades\Schema;

/**
 * Sugerencias de productos: BD (admin Filament) con fallback al archivo config.
 */
class ProductSuggestionConfig
{
    public const KEY_CATEGORY_PAIRS = 'product_suggestions_category_pairs';

    public const KEY_MAX_RESULTS = 'product_suggestions_max_results';

    public const KEY_MAX_RESULTS_KIOSKO = 'product_suggestions_max_results_kiosko';

    /**
     * @return list<array{from: string, suggest: list<string>, mensaje: string}>
     */
    public static function categoryPairs(): array
    {
        $fromDb = self::getJson(self::KEY_CATEGORY_PAIRS);
        if (is_array($fromDb) && $fromDb !== []) {
            return self::normalizePairs($fromDb);
        }

        return self::normalizePairs(config('product_suggestions.category_pairs', []));
    }

    /**
     * @param  list<array<string, mixed>>  $pairs
     */
    public static function saveCategoryPairs(array $pairs): void
    {
        self::setJson(self::KEY_CATEGORY_PAIRS, self::normalizePairs($pairs));
    }

    public static function maxResults(): int
    {
        $db = self::getNumber(self::KEY_MAX_RESULTS);

        return $db ?? (int) config('product_suggestions.max_results', 6);
    }

    public static function maxResultsKiosko(): int
    {
        $db = self::getNumber(self::KEY_MAX_RESULTS_KIOSKO);

        return $db ?? (int) config('product_suggestions.max_results_kiosko', 3);
    }

    public static function saveLimits(int $maxResults, int $maxResultsKiosko): void
    {
        Configuracion::establecer(self::KEY_MAX_RESULTS, max(1, $maxResults), 'number');
        Configuracion::establecer(self::KEY_MAX_RESULTS_KIOSKO, max(1, $maxResultsKiosko), 'number');
    }

    public static function clearOverrides(): void
    {
        if (! Schema::hasTable('configuracion')) {
            return;
        }

        Configuracion::query()
            ->whereIn('clave', [
                self::KEY_CATEGORY_PAIRS,
                self::KEY_MAX_RESULTS,
                self::KEY_MAX_RESULTS_KIOSKO,
            ])
            ->delete();
    }

    public static function hasDbOverrides(): bool
    {
        if (! Schema::hasTable('configuracion')) {
            return false;
        }

        return Configuracion::query()
            ->whereIn('clave', [
                self::KEY_CATEGORY_PAIRS,
                self::KEY_MAX_RESULTS,
                self::KEY_MAX_RESULTS_KIOSKO,
            ])
            ->exists();
    }

    /**
     * @return array<string, mixed>
     */
    public static function formDefaults(): array
    {
        return [
            'max_results' => self::maxResults(),
            'max_results_kiosko' => self::maxResultsKiosko(),
            'category_pairs' => self::categoryPairs(),
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $pairs
     * @return list<array{from: string, suggest: list<string>, mensaje: string}>
     */
    public static function normalizePairs(array $pairs): array
    {
        $out = [];

        foreach ($pairs as $pair) {
            if (! is_array($pair)) {
                continue;
            }
            $from = trim((string) ($pair['from'] ?? ''));
            if ($from === '') {
                continue;
            }
            $suggest = array_values(array_unique(array_filter(array_map(
                fn ($c) => trim((string) $c),
                (array) ($pair['suggest'] ?? [])
            ))));
            if ($suggest === []) {
                continue;
            }
            $out[] = [
                'from' => $from,
                'suggest' => $suggest,
                'mensaje' => trim((string) ($pair['mensaje'] ?? 'Te puede interesar')) ?: 'Te puede interesar',
            ];
        }

        return $out;
    }

    private static function getJson(string $key): mixed
    {
        if (! Schema::hasTable('configuracion')) {
            return null;
        }

        return Configuracion::obtener($key);
    }

    private static function setJson(string $key, mixed $value): void
    {
        if (! Schema::hasTable('configuracion')) {
            return;
        }

        Configuracion::establecer($key, $value, 'json');
    }

    private static function getNumber(string $key): ?int
    {
        if (! Schema::hasTable('configuracion')) {
            return null;
        }

        $val = Configuracion::obtener($key);
        if ($val === null || $val === '') {
            return null;
        }

        return max(1, (int) $val);
    }
}
