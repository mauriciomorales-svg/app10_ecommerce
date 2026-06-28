<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;

class ProductImageUrlService
{
    private const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    /** Códigos legacy que no corresponden a un archivo real en disco. */
    private const INVALID_BARCODES = ['SIN_CODIGO', 'SIN CODIGO', 'N/A', 'NA'];

    /** PNG de sync erróneo (chorrillana genérica) — no usar si hay foto web del pack. */
    private const PLACEHOLDER_FOTO_MAX_BYTES = 400_000;

    /**
     * Ruta pública para catálogo: foto web estática del pack (si existe) o fotos_productos.
     */
    public static function resolveForProduct(?string $nombre, ?string $codigobarra, ?int $idproducto = null): ?string
    {
        $static = self::resolveStaticWebImage($nombre);
        if ($static !== null) {
            return $static;
        }

        $fromFotos = self::resolvePath($codigobarra, $idproducto);
        if ($fromFotos === null) {
            return null;
        }

        $mappedStatic = self::staticWebImageMap()[trim((string) $nombre)] ?? null;
        if ($mappedStatic !== null && self::isPlaceholderFoto($fromFotos)) {
            $verified = self::verifyStaticWebPath($mappedStatic);

            return $verified ?? $fromFotos;
        }

        return $fromFotos;
    }

    /**
     * Imagen curada en /images/... (packs regalo, combos cocina, salada).
     */
    public static function resolveStaticWebImage(?string $nombre): ?string
    {
        $nombre = trim((string) $nombre);
        if ($nombre === '') {
            return null;
        }

        $relative = self::staticWebImageMap()[$nombre] ?? null;
        if ($relative === null) {
            return null;
        }

        return self::verifyStaticWebPath($relative);
    }

    /**
     * Ruta pública relativa (/fotos_productos/...) si existe archivo en disco.
     * Busca por codigobarra y, si no hay match, por idproducto (fotos legacy).
     */
    public static function resolvePath(?string $codigobarra, ?int $idproducto = null): ?string
    {
        $codigo = self::normalizeBarcode($codigobarra);
        if ($codigo !== null) {
            $relative = self::findRelativePath("fotos_productos/{$codigo}");
            if ($relative !== null) {
                return '/' . $relative;
            }
        }

        if ($idproducto !== null && $idproducto > 0) {
            $relative = self::findRelativePath("fotos_productos/{$idproducto}");
            if ($relative !== null) {
                return '/' . $relative;
            }
        }

        return null;
    }

    /**
     * @param  array<int>  $productIds
     * @return array<int, string|null>
     */
    public static function urlsForIds(array $productIds): array
    {
        $ids = array_values(array_unique(array_filter(array_map('intval', $productIds))));
        if ($ids === []) {
            return [];
        }

        $rows = \Illuminate\Support\Facades\DB::table('productos')
            ->whereIn('idproducto', $ids)
            ->get(['idproducto', 'nombre', 'codigobarra', 'imagen']);

        $out = array_fill_keys($ids, null);
        foreach ($rows as $row) {
            $id = (int) $row->idproducto;
            $fromFile = self::resolveForProduct($row->nombre ?? null, $row->codigobarra ?? null, $id);
            if ($fromFile !== null) {
                $out[$id] = $fromFile;
                continue;
            }
            if (! empty($row->imagen)) {
                $out[$id] = "/api/productos/{$id}/imagen";
            }
        }

        return $out;
    }

    /** Orden igual que la tienda: primero productos con foto en disco o bytea. */
    public static function applyImageFirstOrdering(Builder $query): Builder
    {
        $stems = self::photoStemsOnDisk();
        $table = $query->getModel()->getTable();

        if ($stems === []) {
            return $query->orderByRaw(
                "CASE WHEN {$table}.imagen IS NOT NULL AND length({$table}.imagen) > 0 THEN 0 ELSE 1 END ASC"
            );
        }

        $binds = implode(',', array_fill(0, count($stems), '?'));

        return $query->orderByRaw(
            "CASE WHEN {$table}.codigobarra IN ({$binds}) "
            . "OR CAST({$table}.idproducto AS TEXT) IN ({$binds}) "
            . "OR ({$table}.imagen IS NOT NULL AND length({$table}.imagen) > 0) "
            . 'THEN 0 ELSE 1 END ASC',
            array_merge($stems, $stems)
        );
    }

    /**
     * @return array<int, string>
     */
    public static function photoStemsOnDisk(): array
    {
        $fotosDir = public_path('fotos_productos');
        if (! is_dir($fotosDir)) {
            return [];
        }

        $stems = [];
        foreach (glob($fotosDir . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE) ?: [] as $file) {
            $stems[] = pathinfo($file, PATHINFO_FILENAME);
        }

        return $stems;
    }

    /**
     * URL absoluta para mostrar en admin/tienda.
     * Con $cacheBust agrega ?t=filemtime para evitar ver la foto anterior en caché del navegador.
     */
    public static function absoluteUrl(?string $relativePath, bool $cacheBust = false): ?string
    {
        if ($relativePath === null || $relativePath === '') {
            return null;
        }

        if (str_starts_with($relativePath, 'http://') || str_starts_with($relativePath, 'https://')) {
            $url = $relativePath;
            $localPath = null;
        } else {
            $url = url($relativePath);
            $localPath = public_path(ltrim($relativePath, '/'));
        }

        if (! $cacheBust) {
            return $url;
        }

        if ($localPath !== null && is_file($localPath)) {
            return $url . '?t=' . filemtime($localPath);
        }

        if (str_contains($relativePath, '/api/productos/') && preg_match('#/api/productos/(\d+)/imagen#', $relativePath, $m)) {
            return $url . '?t=' . time();
        }

        return $url . '?t=' . time();
    }

    private static function normalizeBarcode(?string $codigo): ?string
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

    private static function findRelativePath(string $baseWithoutExt): ?string
    {
        $newest = null;
        $newestMtime = 0;

        foreach (self::EXTENSIONS as $ext) {
            $path = public_path("{$baseWithoutExt}.{$ext}");
            if (! is_file($path)) {
                continue;
            }

            $mtime = filemtime($path) ?: 0;
            if ($mtime >= $newestMtime) {
                $newestMtime = $mtime;
                $newest = "{$baseWithoutExt}.{$ext}";
            }
        }

        return $newest;
    }

    /** @var array<string, string>|null */
    private static ?array $staticWebImageMapCache = null;

    /**
     * @return array<string, string> nombre producto → ruta /images/...
     */
    private static function staticWebImageMap(): array
    {
        if (self::$staticWebImageMapCache !== null) {
            return self::$staticWebImageMapCache;
        }

        $map = [];
        foreach ((array) config('packs_tarjetas_premium.tarjetas', []) as $tarjeta) {
            $nombre = trim((string) ($tarjeta['nombre'] ?? ''));
            $imagen = (string) ($tarjeta['imagen'] ?? '');
            if ($nombre !== '' && str_starts_with($imagen, '/images/')) {
                $map[$nombre] = $imagen;
            }
        }
        foreach ((array) config('salada_destacados.destacados', []) as $item) {
            $nombre = trim((string) ($item['nombre'] ?? ''));
            $imagen = (string) ($item['imagen'] ?? '');
            if ($nombre !== '' && str_starts_with($imagen, '/images/')) {
                $map[$nombre] = $imagen;
            }
        }

        self::$staticWebImageMapCache = $map;

        return $map;
    }

    private static function verifyStaticWebPath(string $relativePath): ?string
    {
        foreach (self::staticWebImageRoots() as $root) {
            $full = $root . ltrim($relativePath, '/');
            if (is_file($full)) {
                return $relativePath;
            }
        }

        return null;
    }

    /** @return array<int, string> */
    private static function staticWebImageRoots(): array
    {
        $roots = [public_path('')];
        foreach ([
            base_path('frontend-ecommerce/public'),
            base_path('../frontend-ecommerce/public'),
        ] as $candidate) {
            if (is_dir($candidate)) {
                $roots[] = rtrim($candidate, '/\\') . DIRECTORY_SEPARATOR;
            }
        }

        return array_values(array_unique($roots));
    }

    private static function isPlaceholderFoto(string $relativePath): bool
    {
        if (! str_starts_with($relativePath, '/fotos_productos/')) {
            return false;
        }

        $full = public_path(ltrim($relativePath, '/'));
        if (! is_file($full)) {
            return false;
        }

        return filesize($full) <= self::PLACEHOLDER_FOTO_MAX_BYTES;
    }
}
