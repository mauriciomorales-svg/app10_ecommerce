<?php

namespace App\Filament\Resources\KioskDemandaResource\Widgets;

use App\Filament\Resources\ProductoResource;
use Filament\Widgets\Widget;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class TopDemandaNoEncontradaWidget extends Widget
{
    protected static ?int $sort = 1;

    protected int | string | array $columnSpan = 'full';

    protected static ?string $heading = 'Top búsquedas sin resultado (7 días)';

    protected string $view = 'filament.widgets.kiosk-top-demanda';

    /** @return Collection<int, object> */
    public function getRows(): Collection
    {
        if (! Schema::hasTable('kiosk_search_logs')) {
            return collect();
        }

        return DB::table('kiosk_search_logs')
            ->selectRaw('query_normalized as query, COUNT(*) as veces, MAX(created_at) as ultima')
            ->where('created_at', '>=', now()->subDays(7))
            ->whereIn('outcome', ['not_found', 'other', 'out_of_stock'])
            ->whereNotIn('query_normalized', ['hola'])
            ->whereRaw("query_normalized NOT LIKE 'menu_%'")
            ->groupBy('query_normalized')
            ->orderByDesc('veces')
            ->limit(12)
            ->get();
    }

    public function catalogUrl(string $query): string
    {
        return ProductoResource::getUrl('index') . '?tableSearch=' . urlencode($query);
    }

    public function createProductUrl(string $query): string
    {
        return ProductoResource::getUrl('create') . '?nombre=' . urlencode($query);
    }
}
