@php
    $productos = $this->getProductos();
@endphp

<x-filament-panels::page>
    <div class="dm-productos-list">
        <form method="get" action="{{ url()->current() }}" class="dm-productos-toolbar">
            <input
                type="search"
                name="buscar"
                value="{{ request('buscar') }}"
                placeholder="Buscar por nombre o código…"
                class="dm-productos-search"
            />
            <select name="per_page" class="dm-productos-select" onchange="this.form.submit()">
                @foreach ([25, 50, 100] as $n)
                    <option value="{{ $n }}" @selected((int) request('per_page', 25) === $n)>{{ $n }} / pág.</option>
                @endforeach
            </select>
            <button type="submit" class="dm-productos-btn dm-productos-btn-primary">Buscar</button>
            @if (request()->hasAny(['buscar', 'idcategoria', 'activo']))
                <a href="{{ url()->current() }}" class="dm-productos-btn">Limpiar</a>
            @endif
        </form>

        <p class="dm-productos-summary">
            Mostrando {{ number_format($productos->firstItem() ?? 0, 0, ',', '.') }}
            a {{ number_format($productos->lastItem() ?? 0, 0, ',', '.') }}
            de {{ number_format($productos->total(), 0, ',', '.') }} productos
        </p>

        <div class="dm-productos-table-wrap">
            <table class="dm-productos-table">
                <thead>
                    <tr>
                        <th>Foto</th>
                        <th>Nombre</th>
                        <th>Código</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Activo</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($productos as $producto)
                        <tr>
                            <td class="dm-productos-photo-cell">
                                @php
                                    $fotoUrl = \App\Filament\Resources\ProductoResource::productImagePreviewUrl($producto);
                                    $phVariant = \App\Filament\Resources\ProductoResource::inferPlaceholderVariant($producto);
                                    $phLabel = \App\Filament\Resources\ProductoResource::placeholderLabel($phVariant);
                                @endphp
                                <div class="dm-productos-thumb-frame" wire:ignore>
                                    @if ($fotoUrl)
                                        <img
                                            src="{{ $fotoUrl }}"
                                            alt="{{ $producto->nombre }}"
                                            class="dm-productos-thumb"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    @else
                                        <div class="dm-productos-thumb-placeholder dm-ph-{{ $phVariant }}" title="Sin foto">
                                            <span class="dm-ph-icon" aria-hidden="true"></span>
                                            <span class="dm-ph-label">{{ $phLabel }}</span>
                                        </div>
                                    @endif
                                </div>
                            </td>
                            <td class="dm-productos-name">{{ $producto->nombre }}</td>
                            <td>{{ $producto->codigobarra }}</td>
                            <td>{{ $producto->categoria?->nombre ?? '—' }}</td>
                            <td>${{ number_format((float) $producto->precio, 0, ',', '.') }}</td>
                            <td class="text-center">{{ $producto->stock_actual }}</td>
                            <td class="text-center">
                                @if ($producto->activo)
                                    <span class="dm-badge dm-badge-ok">Sí</span>
                                @else
                                    <span class="dm-badge dm-badge-off">No</span>
                                @endif
                            </td>
                            <td class="text-right">
                                <a
                                    href="{{ \App\Filament\Resources\ProductoResource::getUrl('edit', ['record' => $producto]) }}"
                                    class="dm-productos-link"
                                >Editar</a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="dm-productos-empty">No hay productos con esos filtros.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if ($productos->lastPage() > 1)
            <nav class="dm-store-pagination" aria-label="Paginación">
                @php
                    $prevUrl = $productos->currentPage() > 1
                        ? $productos->url($productos->currentPage() - 1)
                        : null;
                    $nextUrl = $productos->hasMorePages()
                        ? $productos->url($productos->currentPage() + 1)
                        : null;
                @endphp

                @if ($prevUrl)
                    <a href="{{ $prevUrl }}" class="dm-store-pagination-btn dm-store-pagination-prev">‹ Ant.</a>
                @else
                    <span class="dm-store-pagination-btn dm-store-pagination-prev is-disabled">‹ Ant.</span>
                @endif

                <span class="dm-store-pagination-info">
                    {{ $productos->currentPage() }} / {{ $productos->lastPage() }}
                </span>

                @if ($nextUrl)
                    <a href="{{ $nextUrl }}" class="dm-store-pagination-btn dm-store-pagination-next">Sig. ›</a>
                @else
                    <span class="dm-store-pagination-btn dm-store-pagination-next is-disabled">Sig. ›</span>
                @endif
            </nav>
        @endif
    </div>
</x-filament-panels::page>
