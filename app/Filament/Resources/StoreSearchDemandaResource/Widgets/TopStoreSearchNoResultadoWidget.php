<?php

namespace App\Filament\Resources\StoreSearchDemandaResource\Widgets;

use App\Filament\Resources\ProductoResource;
use Filament\Widgets\Widget;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TopStoreSearchNoResultadoWidget extends Widget
{
    protected static ?int $sort = 1;

    protected int | string | array $columnSpan = 'full';

    protected static ?string $heading = 'Top búsquedas sin resultado (7 días)';

    protected string $view = 'filament.widgets.store-top-busqueda';

    /** @return Collection<int, object> */
    public function getRows(): Collection
    {
        if (! Schema::hasTable('store_search_logs')) {
            return collect();
        }

        return DB::table('store_search_logs')
            ->selectRaw('query_normalized as query, scope, COUNT(*) as veces, MAX(created_at) as ultima')
            ->where('created_at', '>=', now()->subDays(7))
            ->where('outcome', 'not_found')
            ->groupBy('query_normalized', 'scope')
            ->orderByDesc('veces')
            ->limit(15)
            ->get();
    }

    public function scopeLabel(string $scope): string
    {
        return match ($scope) {
            'regalos' => 'Regalos',
            'salada' => 'Comida',
            'helados' => 'Helados',
            'packs' => 'Packs',
            default => 'Inicio',
        };
    }

    public function catalogUrl(string $query): string
    {
        return ProductoResource::getUrl('index').'?tableSearch='.urlencode($query);
    }

    public function createProductUrl(string $query): string
    {
        return ProductoResource::getUrl('create').'?nombre='.urlencode($query);
    }
}
