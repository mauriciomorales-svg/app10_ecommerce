<?php

namespace App\Services;

use App\Models\StoreSearchLog;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class StoreSearchLogService
{
    public function __construct(
        private ProductSearchService $searchService,
    ) {}

    public function log(
        string $query,
        string $scope,
        int $totalResults,
        ?string $sessionId = null,
        ?string $page = null,
    ): void {
        if (! config('store_search.analytics_enabled', true)) {
            return;
        }

        if (! Schema::hasTable('store_search_logs')) {
            return;
        }

        $query = trim($query);
        $minLen = max(1, (int) config('store_search.min_query_length', 2));
        if (mb_strlen($query) < $minLen) {
            return;
        }

        $scope = $this->normalizeScope($scope);
        $normalized = $this->searchService->normalizeTerm($query);
        if ($normalized === '') {
            return;
        }

        $dedupeKey = sprintf(
            'store_search:%s:%s:%s',
            $scope,
            $normalized,
            $sessionId ? substr($sessionId, 0, 32) : 'anon',
        );
        $dedupeSeconds = max(0, (int) config('store_search.dedupe_seconds', 90));
        if ($dedupeSeconds > 0) {
            try {
                if (! Cache::add($dedupeKey, 1, $dedupeSeconds)) {
                    return;
                }
            } catch (\Throwable) {
                // Sin Redis/cache: registrar igual (prod usa cache)
            }
        }

        $outcome = $totalResults > 0 ? 'found' : 'not_found';

        try {
            StoreSearchLog::create([
                'query' => mb_substr($query, 0, 255),
                'query_normalized' => mb_substr($normalized, 0, 255),
                'scope' => $scope,
                'outcome' => $outcome,
                'total_results' => max(0, $totalResults),
                'session_id' => $sessionId ? mb_substr($sessionId, 0, 64) : null,
                'page' => $page ? mb_substr($page, 0, 255) : null,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('StoreSearchLog: '.$e->getMessage());
        }
    }

    public function normalizeScope(?string $alcance): string
    {
        $key = mb_strtolower(trim((string) $alcance));

        return match ($key) {
            'regalos', 'salada', 'helados', 'packs' => $key,
            'home', 'todos', '' => 'home',
            default => $key !== '' ? mb_substr($key, 0, 32) : 'home',
        };
    }
}
