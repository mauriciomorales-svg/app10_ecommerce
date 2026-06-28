<?php

namespace App\Filament\Resources\StoreSearchDemandaResource\Widgets;

use App\Filament\Resources\StoreSearchDemandaResource;
use App\Models\StoreSearchLog;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Schema;

class StoreSearchDemandaStatsWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 0;

    protected ?string $heading = 'Buscador web — últimos 7 días';

    protected function getStats(): array
    {
        if (! Schema::hasTable('store_search_logs')) {
            return [
                Stat::make('Buscador web', 'Sin datos')
                    ->description('Ejecutá php artisan migrate')
                    ->color('gray'),
            ];
        }

        $since = now()->subDays(7);
        $base = StoreSearchLog::query()->where('created_at', '>=', $since);

        $total = (clone $base)->count();
        $notFound = (clone $base)->where('outcome', 'not_found')->count();
        $found = (clone $base)->where('outcome', 'found')->count();
        $pct = $total > 0 ? round(100 * $notFound / $total, 1) : 0;

        return [
            Stat::make('Búsquedas', number_format($total, 0, ',', '.'))
                ->description('dondemorales.cl')
                ->descriptionIcon('heroicon-m-magnifying-glass')
                ->color('primary')
                ->url(StoreSearchDemandaResource::getUrl('index')),
            Stat::make('Sin resultados', number_format($notFound, 0, ',', '.'))
                ->description("{$pct}% del total · oportunidad catálogo")
                ->descriptionIcon('heroicon-m-magnifying-glass-minus')
                ->color($notFound > 0 ? 'danger' : 'success')
                ->url(StoreSearchDemandaResource::getUrl('index', ['tableFilters' => ['sin_resultado' => ['isActive' => true]]])),
            Stat::make('Con resultados', number_format($found, 0, ',', '.'))
                ->description('Términos que sí devolvieron productos')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success'),
        ];
    }
}
