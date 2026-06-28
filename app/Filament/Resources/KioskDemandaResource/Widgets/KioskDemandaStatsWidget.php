<?php

namespace App\Filament\Resources\KioskDemandaResource\Widgets;

use App\Filament\Resources\KioskDemandaResource;
use App\Models\KioskSearchLog;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Schema;

class KioskDemandaStatsWidget extends StatsOverviewWidget
{
    protected static ?int $sort = 0;

    protected ?string $heading = 'Kiosco «¿Lo tenemos?» — últimos 7 días';

    protected function getStats(): array
    {
        if (! Schema::hasTable('kiosk_search_logs')) {
            return [
                Stat::make('Kiosco', 'Sin datos')
                    ->description('Tabla kiosk_search_logs no disponible')
                    ->color('gray'),
            ];
        }

        $since = now()->subDays(7);
        $base = KioskSearchLog::query()->where('created_at', '>=', $since);

        $total = (clone $base)->count();
        $notFound = (clone $base)->whereIn('outcome', ['not_found', 'other'])->count();
        $sinStock = (clone $base)->where('outcome', 'out_of_stock')->count();
        $found = (clone $base)->whereIn('outcome', ['found', 'product_detail', 'partial'])->count();

        return [
            Stat::make('Consultas', number_format($total, 0, ',', '.'))
                ->description('Pantalla /inventario/kiosk/')
                ->descriptionIcon('heroicon-m-microphone')
                ->color('primary')
                ->url(KioskDemandaResource::getUrl('index')),
            Stat::make('No encontrado', number_format($notFound, 0, ',', '.'))
                ->description('Oportunidad de catálogo')
                ->descriptionIcon('heroicon-m-magnifying-glass-minus')
                ->color($notFound > 0 ? 'danger' : 'success')
                ->url(KioskDemandaResource::getUrl('index', ['tableFilters' => ['demanda' => ['value' => 'sin_resultado']]])),
            Stat::make('Sin stock', number_format($sinStock, 0, ',', '.'))
                ->description('Reposición urgente')
                ->descriptionIcon('heroicon-m-archive-box-x-mark')
                ->color($sinStock > 0 ? 'warning' : 'success'),
            Stat::make('Con resultado', number_format($found, 0, ',', '.'))
                ->description('Encontrado o similar')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success'),
        ];
    }
}
