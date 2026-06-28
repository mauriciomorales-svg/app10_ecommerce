<?php

namespace App\Http\Controllers\Admin;

use App\Filament\Resources\ProductoResource;
use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Services\ProductImageSuggestionService;
use App\Services\ProductPhotoSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductPhotoUploadController extends Controller
{
    public function store(Request $request, Producto $producto): RedirectResponse
    {
        $request->validate([
            'foto' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $tempPath = $request->file('foto')->store('temp-product-photos', 'local');
        $ok = app(ProductPhotoSyncService::class)->publishFromFilamentPath($producto, $tempPath);

        return redirect($this->editUrl($producto, $ok))
            ->with($ok ? 'dm_photo_upload' : 'dm_photo_upload_error', $ok
                ? 'Foto publicada correctamente.'
                : 'No se pudo guardar la foto. Revisa permisos de public/fotos_productos.');
    }

    public function storeFromUrl(Request $request, Producto $producto): RedirectResponse
    {
        $request->validate([
            'image_url' => ['required', 'url', 'max:2048'],
        ]);

        $ok = app(ProductPhotoSyncService::class)->publishFromRemoteUrl(
            $producto,
            (string) $request->input('image_url'),
        );

        return redirect($this->editUrl($producto, $ok))
            ->with($ok ? 'dm_photo_upload' : 'dm_photo_upload_error', $ok
                ? 'Foto aplicada desde la sugerencia.'
                : 'No se pudo descargar esa imagen. Prueba otra sugerencia o sube un archivo.');
    }

    public function storeReference(Request $request, Producto $producto): JsonResponse
    {
        $request->validate([
            'foto' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        $path = $request->file('foto')->store('temp-photo-ref', 'public');

        return response()->json([
            'referenceUrl' => asset('storage/' . $path),
        ]);
    }

    public function destroy(Producto $producto): RedirectResponse
    {
        app(ProductPhotoSyncService::class)->deletePhotosForProduct($producto);

        return redirect($this->editUrl($producto, true))
            ->with('dm_photo_upload', 'Foto eliminada.');
    }

    public function suggestions(Request $request, Producto $producto): JsonResponse
    {
        $producto->loadMissing('categoria');

        $service = app(ProductImageSuggestionService::class);
        $previewUrl = ProductoResource::productImagePreviewUrl($producto);
        $referenceUrl = (string) $request->query('reference_url', '');
        $mode = (string) $request->query('mode', 'visual');

        if ($referenceUrl === '') {
            $referenceUrl = $previewUrl ?? '';
        }

        if ($mode !== 'name') {
            $mode = 'visual';
        }

        return response()->json([
            'mode' => $mode,
            'referenceUrl' => $referenceUrl !== '' ? $referenceUrl : null,
            'googleUrl' => $service->googleImagesUrl($producto, $referenceUrl ?: null),
            'lensUrl' => $service->googleLensUrl($referenceUrl ?: null),
            'reverseUrl' => $service->googleReverseImageUrl($referenceUrl ?: null),
            'items' => $service->searchForProduct(
                $producto,
                $referenceUrl !== '' ? $referenceUrl : null,
                $mode,
            ),
            'hasSerper' => (string) config('services.serper.api_key', '') !== '',
        ]);
    }

    private function editUrl(Producto $producto, bool $freshPreview): string
    {
        $url = ProductoResource::getUrl('edit', ['record' => $producto]);

        if (! $freshPreview) {
            return $url;
        }

        return $url . (str_contains($url, '?') ? '&' : '?') . 'v=' . time();
    }
}
