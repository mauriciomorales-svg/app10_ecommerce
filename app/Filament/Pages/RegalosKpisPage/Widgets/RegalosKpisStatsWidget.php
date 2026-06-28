<?php

namespace App\Filament\Pages\RegalosKpisPage\Widgets;

use App\Filament\Pages\RegalosKpisPage;
use App\Services\RegalosKpisService;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class RegalosKpisStatsWidget extends StatsOverviewWidget
{
    public int $days = 7;

    protected static ?int $sort = 0;

    protected ?string $heading = 'Resumen regalos';

    protected function getStats(): array
    {
        $days = $this->getLivewire() instanceof RegalosKpisPage
            ? $this->getLivewire()->days
            : $this->days;

        $kpi = RegalosKpisService::summary($days);
        $funnel = $kpi['funnel'] ?? [];
        $visitas = $kpi['visitas_regalos'] ?? [];
        $busquedas = $kpi['busquedas_regalos'] ?? [];
        $upsell = $kpi['upsell'] ?? [];
        $compare = $kpi['compare'] ?? [];

        $tasa = $funnel['tasa_completado'] ?? null;

        return [
            Stat::make('Visitas /regalos', number_format((int) ($visitas['page_views'] ?? 0), 0, ',', '.'))
                ->description(($visitas['sesiones'] ?? 0).' sesiones · '.$days.' días')
                ->descriptionIcon('heroicon-m-eye')
                ->color('primary'),
            Stat::make('Quiz completado', number_format((int) ($funnel['completaron'] ?? 0), 0, ',', '.'))
                ->description(
                    ($funnel['iniciaron'] ?? 0).' iniciaron'
                    .($tasa !== null ? " · {$tasa}% conversión" : '')
                )
                ->descriptionIcon('heroicon-m-sparkles')
                ->color($tasa !== null && $tasa >= 40 ? 'success' : 'warning')
                ->url(RegalosKpisPage::getUrl()),
            Stat::make('Upsell checkout', number_format(count($upsell), 0, ',', '.'))
                ->description('Productos distintos añadidos')
                ->descriptionIcon('heroicon-m-shopping-cart')
                ->color('info'),
            Stat::make('Búsquedas sin resultado', number_format((int) ($busquedas['sin_resultado'] ?? 0), 0, ',', '.'))
                ->description('Sección regalos · '.$days.' días')
                ->descriptionIcon('heroicon-m-magnifying-glass-minus')
                ->color(($busquedas['sin_resultado'] ?? 0) > 0 ? 'danger' : 'success'),
            Stat::make('Clicks comparador', number_format((int) ($compare['clicks'] ?? 0), 0, ',', '.'))
                ->description('Reservar desde tabla comparar')
                ->descriptionIcon('heroicon-m-scale')
                ->color('gray'),
        ];
    }
}
