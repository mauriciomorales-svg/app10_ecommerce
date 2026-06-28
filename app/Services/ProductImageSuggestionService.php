<?php

namespace App\Services;

use App\Models\Producto;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductImageSuggestionService
{
    /**
     * @return array<int, array{title: string, imageUrl: string, thumbnailUrl: string, sourceUrl: string}>
     */
    public function searchForProduct(Producto $producto, ?string $referenceImageUrl = null, string $mode = 'visual', int $limit = 8): array
    {
        $key = (string) config('services.serper.api_key', '');
        if ($key === '') {
            return [];
        }

        $queries = $this->buildQueries($producto, $referenceImageUrl, $mode);
        if ($queries === []) {
            return [];
        }

        $merged = [];

        foreach ($queries as $query) {
            $items = $this->searchImages($key, $query, $limit);
            foreach ($items as $item) {
                $merged[$item['imageUrl']] = $item;
            }

            if (count($merged) >= $limit) {
                break;
            }
        }

        return array_values(array_slice($merged, 0, $limit));
    }

    public function googleImagesUrl(Producto $producto, ?string $referenceImageUrl = null): string
    {
        if ($referenceImageUrl && $this->isPublicHttpUrl($referenceImageUrl)) {
            return $this->googleReverseImageUrl($referenceImageUrl);
        }

        $query = $this->primaryTextQuery($producto);

        return 'https://www.google.com/search?q=' . rawurlencode($query) . '&tbm=isch';
    }

    public function googleLensUrl(?string $imageUrl): ?string
    {
        if (! $imageUrl || ! $this->isPublicHttpUrl($imageUrl)) {
            return null;
        }

        return 'https://lens.google.com/uploadbyurl?url=' . rawurlencode($imageUrl);
    }

    public function googleReverseImageUrl(?string $imageUrl): ?string
    {
        if (! $imageUrl || ! $this->isPublicHttpUrl($imageUrl)) {
            return null;
        }

        return 'https://www.google.com/searchbyimage?image_url=' . rawurlencode($imageUrl) . '&hl=es';
    }

    /**
     * @return list<string>
     */
    private function buildQueries(Producto $producto, ?string $referenceImageUrl, string $mode): array
    {
        $nombre = trim((string) $producto->nombre);
        $codigo = trim((string) $producto->codigobarra);
        $categoria = trim((string) ($producto->categoria?->nombre ?? ''));

        if ($mode === 'name') {
            return array_values(array_filter([
                $nombre !== '' ? $nombre . ' producto' : null,
                $codigo !== '' ? $codigo . ' producto' : null,
            ]));
        }

        // Modo visual: prioriza código de barras y empaque real (como buscar "respecto a la foto").
        $queries = [];

        if ($codigo !== '' && ! in_array(strtoupper($codigo), ['SIN_CODIGO', 'N/A', 'NA'], true)) {
            $queries[] = $codigo;
            $queries[] = $codigo . ' producto';
            $queries[] = $codigo . ' packshot';
        }

        if ($nombre !== '') {
            $queries[] = $nombre . ' packshot producto';
            $queries[] = $nombre . ' empaque';
            if ($categoria !== '') {
                $queries[] = $nombre . ' ' . $categoria;
            }
        }

        if ($referenceImageUrl && $this->isPublicHttpUrl($referenceImageUrl)) {
            // Refuerzo cuando hay foto de referencia visible.
            $queries[] = $nombre . ' imagen producto fondo blanco';
        }

        return array_values(array_unique(array_filter($queries)));
    }

    /**
     * @return array<int, array{title: string, imageUrl: string, thumbnailUrl: string, sourceUrl: string}>
     */
    private function searchImages(string $key, string $query, int $limit): array
    {
        try {
            $response = Http::withHeaders([
                'X-API-KEY' => $key,
                'Content-Type' => 'application/json',
            ])
                ->timeout(12)
                ->post('https://google.serper.dev/images', [
                    'q' => $query,
                    'num' => min($limit, 10),
                    'gl' => 'cl',
                    'hl' => 'es',
                ]);

            if (! $response->successful()) {
                Log::info('ProductImageSuggestion: Serper respondió error', [
                    'status' => $response->status(),
                    'query' => $query,
                ]);

                return [];
            }

            $images = $response->json('images') ?? [];

            return collect($images)
                ->map(function (array $item): ?array {
                    $imageUrl = (string) ($item['imageUrl'] ?? $item['image_url'] ?? '');
                    if ($imageUrl === '' || ! $this->isPublicHttpUrl($imageUrl)) {
                        return null;
                    }

                    $thumbnail = (string) ($item['thumbnailUrl'] ?? $item['thumbnail'] ?? $imageUrl);

                    return [
                        'title' => (string) ($item['title'] ?? ''),
                        'imageUrl' => $imageUrl,
                        'thumbnailUrl' => $thumbnail !== '' ? $thumbnail : $imageUrl,
                        'sourceUrl' => (string) ($item['link'] ?? $imageUrl),
                    ];
                })
                ->filter()
                ->values()
                ->all();
        } catch (\Throwable $e) {
            Log::info('ProductImageSuggestion: falló la búsqueda', [
                'message' => $e->getMessage(),
                'query' => $query,
            ]);

            return [];
        }
    }

    private function primaryTextQuery(Producto $producto): string
    {
        $parts = array_filter([
            trim((string) $producto->nombre),
            trim((string) $producto->codigobarra),
        ]);

        return implode(' ', $parts);
    }

    private function isPublicHttpUrl(string $url): bool
    {
        if (! filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }

        $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));

        return in_array($scheme, ['http', 'https'], true);
    }
}
