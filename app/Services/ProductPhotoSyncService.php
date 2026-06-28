<?php

namespace App\Services;

use App\Models\Producto;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductPhotoSyncService
{
    private const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    private const INVALID_BARCODES = ['SIN_CODIGO', 'SIN CODIGO', 'N/A', 'NA'];

    /**
     * Publica la foto en public/fotos_productos (web + admin) y sincroniza inventario-api si responde.
     */
    public function publishFromFilamentPath(Producto $producto, string $storagePath): bool
    {
        $disk = Storage::disk('local');
        if (! $disk->exists($storagePath)) {
            Log::warning('ProductPhotoSync: archivo no encontrado', ['path' => $storagePath]);

            return false;
        }

        $fullPath = $disk->path($storagePath);
        $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION) ?: 'jpg');
        if (! in_array($ext, self::EXTENSIONS, true)) {
            $ext = 'jpg';
        }

        $basename = $this->photoBasename($producto);
        if ($basename === null) {
            return false;
        }

        $destDir = public_path('fotos_productos');
        if (! is_dir($destDir) && ! mkdir($destDir, 0775, true) && ! is_dir($destDir)) {
            Log::warning('ProductPhotoSync: no se pudo crear carpeta fotos_productos');

            return false;
        }

        Storage::disk('local')->makeDirectory('temp-product-photos');

        $this->deletePhotosForProduct($producto);

        $dest = $destDir . DIRECTORY_SEPARATOR . $basename . '.' . $ext;
        if (! copy($fullPath, $dest)) {
            Log::warning('ProductPhotoSync: no se pudo copiar a public', ['dest' => $dest]);

            return false;
        }

        touch($dest);

        $codigo = $this->normalizeBarcode($producto->codigobarra);
        if ($codigo !== null) {
            $this->tryInventarioUpload($codigo, $fullPath);
        }

        clearstatcache(true, $dest);
        $disk->delete($storagePath);

        return true;
    }

    /** @deprecated Use publishFromFilamentPath() */
    public function uploadFromFilamentPath(string $codigobarra, string $storagePath): bool
    {
        $producto = Producto::query()
            ->withoutGlobalScopes(['commerce_store'])
            ->where('codigobarra', $codigobarra)
            ->first();

        if (! $producto) {
            return false;
        }

        return $this->publishFromFilamentPath($producto, $storagePath);
    }

    public function deleteByCodigo(?string $codigobarra): bool
    {
        if (blank($codigobarra)) {
            return false;
        }

        return $this->deleteFilesByBasename((string) $codigobarra);
    }

    public function deletePhotosForProduct(Producto $producto): bool
    {
        $deleted = false;

        $codigo = $this->normalizeBarcode($producto->codigobarra);
        if ($codigo !== null) {
            $deleted = $this->deleteFilesByBasename($codigo) || $deleted;
        }

        if ($producto->idproducto) {
            $deleted = $this->deleteFilesByBasename((string) $producto->idproducto) || $deleted;
        }

        return $deleted;
    }

    public function photoBasenameFor(Producto $producto): ?string
    {
        return $this->photoBasename($producto);
    }

    public function publishFromRemoteUrl(Producto $producto, string $url): bool
    {
        if (! filter_var($url, FILTER_VALIDATE_URL)) {
            return false;
        }

        $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
        if (! in_array($scheme, ['http', 'https'], true)) {
            return false;
        }

        try {
            $response = Http::withHeaders([
                'User-Agent' => 'DondeMorales-Admin/1.0',
                'Accept' => 'image/*',
            ])
                ->timeout(20)
                ->get($url);

            if (! $response->successful()) {
                return false;
            }

            $body = $response->body();
            if ($body === '' || strlen($body) < 2000) {
                return false;
            }

            $contentType = strtolower((string) $response->header('Content-Type'));
            $ext = match (true) {
                str_contains($contentType, 'png') => 'png',
                str_contains($contentType, 'webp') => 'webp',
                str_contains($contentType, 'jpeg'), str_contains($contentType, 'jpg') => 'jpg',
                default => null,
            };

            if ($ext === null) {
                return false;
            }

            Storage::disk('local')->makeDirectory('temp-product-photos');
            $tempPath = 'temp-product-photos/' . uniqid('remote_', true) . '.' . $ext;
            Storage::disk('local')->put($tempPath, $body);

            return $this->publishFromFilamentPath($producto, $tempPath);
        } catch (\Throwable $e) {
            Log::warning('ProductPhotoSync: no se pudo descargar imagen remota', [
                'url' => $url,
                'message' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private function photoBasename(Producto $producto): ?string
    {
        $codigo = $this->normalizeBarcode($producto->codigobarra);
        if ($codigo !== null) {
            return $codigo;
        }

        if ($producto->idproducto) {
            return (string) $producto->idproducto;
        }

        return null;
    }

    private function normalizeBarcode(?string $codigo): ?string
    {
        $codigo = trim((string) $codigo);
        if ($codigo === '') {
            return null;
        }

        $normalized = strtoupper(str_replace(' ', '_', $codigo));
        foreach (self::INVALID_BARCODES as $invalid) {
            if ($normalized === strtoupper(str_replace(' ', '_', $invalid))) {
                return null;
            }
        }

        return $codigo;
    }

    private function deleteFilesByBasename(string $basename): bool
    {
        $deleted = false;

        foreach (self::EXTENSIONS as $ext) {
            $publicPath = public_path("fotos_productos/{$basename}.{$ext}");
            if (is_file($publicPath) && unlink($publicPath)) {
                $deleted = true;
            }

            $storagePath = "fotos_productos/{$basename}.{$ext}";
            if (Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->delete($storagePath);
                $deleted = true;
            }
        }

        return $deleted;
    }

    private function tryInventarioUpload(string $codigobarra, string $fullPath): void
    {
        $base = rtrim((string) config('services.inventario.url'), '/');
        if ($base === '') {
            return;
        }

        try {
            $response = Http::withHeaders($this->internalHeaders())
                ->timeout(60)
                ->attach('foto', fopen($fullPath, 'r'), basename($fullPath))
                ->post("{$base}/productos/" . rawurlencode($codigobarra) . '/foto');

            if (! $response->successful()) {
                Log::info('ProductPhotoSync: inventario-api no sincronizado', [
                    'codigo' => $codigobarra,
                    'status' => $response->status(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::info('ProductPhotoSync: inventario-api omitido', ['message' => $e->getMessage()]);
        }
    }

    /** @return array<string, string> */
    private function internalHeaders(): array
    {
        $key = (string) config('services.inventario.internal_key', '');

        return $key !== '' ? ['X-Internal-Key' => $key] : [];
    }
}
