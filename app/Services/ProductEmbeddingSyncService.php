<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductEmbeddingSyncService
{
    public function reindex(int $productoId): bool
    {
        if ($productoId <= 0) {
            return false;
        }

        $base = rtrim((string) config('services.inventario.url'), '/');
        $headers = $this->internalHeaders();

        try {
            $response = Http::withHeaders($headers)
                ->timeout(90)
                ->post("{$base}/internal/productos/{$productoId}/reindex-embedding");

            if (! $response->successful()) {
                Log::warning('ProductEmbeddingSync: fallo API', [
                    'id' => $productoId,
                    'status' => $response->status(),
                    'body' => substr($response->body(), 0, 300),
                ]);

                return false;
            }

            return (bool) ($response->json('success') ?? true);
        } catch (\Throwable $e) {
            Log::warning('ProductEmbeddingSync: ' . $e->getMessage());

            return false;
        }
    }

    /** @return array<string, string> */
    private function internalHeaders(): array
    {
        $key = (string) config('services.inventario.internal_key', '');

        return $key !== '' ? ['X-Internal-Key' => $key] : [];
    }
}
