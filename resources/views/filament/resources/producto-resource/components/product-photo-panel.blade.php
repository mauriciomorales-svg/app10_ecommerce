@php
    use App\Services\ProductImageSuggestionService;

    $previewUrl = \App\Filament\Resources\ProductoResource::productImagePreviewUrl($producto);
    $uploadUrl = url('/admin/productos/' . $producto->idproducto . '/foto');
    $deleteUrl = url('/admin/productos/' . $producto->idproducto . '/foto/eliminar');
    $fromUrlPost = url('/admin/productos/' . $producto->idproducto . '/foto/desde-url');
    $referenceUrl = url('/admin/productos/' . $producto->idproducto . '/foto/referencia-temp');
    $suggestionsUrl = url('/admin/productos/' . $producto->idproducto . '/foto/sugerencias');
    $service = app(ProductImageSuggestionService::class);
    $googleVisualUrl = $previewUrl ? $service->googleReverseImageUrl($previewUrl) : null;
    $lensUrl = $previewUrl ? $service->googleLensUrl($previewUrl) : null;
@endphp

<div
    id="dm-photo-panel-root"
    class="dm-photo-panel"
    wire:ignore
    data-upload-url="{{ $uploadUrl }}"
    data-delete-url="{{ $deleteUrl }}"
    data-from-url="{{ $fromUrlPost }}"
    data-reference-url="{{ $referenceUrl }}"
    data-suggestions-url="{{ $suggestionsUrl }}"
    data-preview-url="{{ $previewUrl ?? '' }}"
    data-has-preview="{{ $previewUrl ? '1' : '0' }}"
>
    <div class="dm-photo-panel-layout">
        <div class="dm-photo-panel-previews">
            @if ($previewUrl)
                <img
                    id="dm-photo-current"
                    src="{{ $previewUrl }}"
                    alt="{{ $producto->nombre }}"
                    class="dm-photo-panel-img"
                />
            @else
                <div id="dm-photo-empty" class="dm-photo-panel-empty">
                    <span>Sin foto</span>
                </div>
            @endif

            <img
                id="dm-photo-new"
                class="dm-photo-panel-img dm-photo-panel-img-new"
                alt="Vista previa"
                hidden
            />
        </div>

        <div class="dm-photo-panel-actions">
            <p id="dm-photo-new-label" class="dm-photo-panel-new-label" hidden>
                Vista previa — pulsa «Guardar foto» para aplicar
            </p>

            <div class="dm-photo-search-tools">
                @if ($googleVisualUrl)
                    <a
                        href="{{ $googleVisualUrl }}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="dm-photo-google-link"
                    >
                        Buscar similares en Google
                    </a>
                @endif
                @if ($lensUrl)
                    <a
                        href="{{ $lensUrl }}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="dm-photo-google-link"
                    >
                        Google Lens (foto actual)
                    </a>
                @endif
                <button type="button" class="dm-photo-suggestions-btn" id="dm-photo-load-visual" data-mode="visual">
                    Sugerencias según la foto
                </button>
                <button type="button" class="dm-photo-suggestions-btn dm-photo-suggestions-btn-muted" id="dm-photo-load-name" data-mode="name">
                    Sugerencias por nombre
                </button>
            </div>

            <div id="dm-photo-suggestions" class="dm-photo-suggestions" hidden>
                <p id="dm-photo-suggestions-hint" class="dm-photo-suggestions-hint">
                    Elige una miniatura y pulsa «Usar esta foto».
                </p>
                <div id="dm-photo-suggestions-grid" class="dm-photo-suggestions-grid"></div>
                <p id="dm-photo-suggestions-empty" class="dm-photo-suggestions-empty" hidden>
                    No hay sugerencias automáticas. Prueba «Buscar similares en Google».
                </p>
            </div>

            <div class="dm-photo-upload-form">
                <label class="dm-photo-upload-picker">
                    <span class="dm-photo-upload-picker-title">Elegir imagen</span>
                    <span class="dm-photo-upload-picker-hint">JPG, PNG o WebP · máx. 5 MB</span>
                    <input
                        type="file"
                        id="dm-photo-file-input"
                        name="foto"
                        accept="image/jpeg,image/png,image/webp"
                        class="dm-photo-upload-input"
                    />
                </label>

                <button type="button" class="dm-photo-upload-submit" id="dm-photo-save-btn">
                    Guardar foto
                </button>
            </div>

            @if ($previewUrl)
                <button type="button" class="dm-photo-remove-btn" id="dm-photo-delete-btn">
                    Eliminar foto
                </button>
            @endif
        </div>
    </div>
</div>
