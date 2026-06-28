<?php

namespace App\Filament\Resources\ProductoResource\Pages;

use App\Filament\Resources\ProductoResource;
use App\Services\ProductImageUrlService;
use Filament\Actions;
use Filament\Resources\Pages\Page;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * Listado con paginación HTTP (?page=N), igual que la tienda Next.js — sin Livewire table.
 */
class ListProductos extends Page
{
    protected static string $resource = ProductoResource::class;

    protected string $view = 'filament.resources.producto-resource.pages.list-productos';

    protected static ?string $title = 'Productos';

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }

    public function getProductos(): LengthAwarePaginator
    {
        $query = ProductoResource::getEloquentQuery();

        $buscar = trim((string) request('buscar', ''));
        if ($buscar !== '') {
            $term = '%' . mb_strtolower($buscar) . '%';
            $query->where(function (Builder $q) use ($term): void {
                $q->whereRaw('LOWER(nombre) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(codigobarra) LIKE ?', [$term]);
            });
        }

        if (request()->filled('idcategoria')) {
            $query->where('idcategoria', (int) request('idcategoria'));
        }

        if (request()->has('activo') && request('activo') !== '') {
            $query->where('activo', request('activo') === '1');
        }

        $perPage = (int) request('per_page', 25);
        if (! in_array($perPage, [25, 50, 100], true)) {
            $perPage = 25;
        }

        ProductImageUrlService::applyImageFirstOrdering($query);

        return $query
            ->orderByDesc('idproducto')
            ->paginate($perPage)
            ->withQueryString();
    }
}
