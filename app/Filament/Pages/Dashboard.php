<?php

namespace App\Filament\Pages;

use App\Filament\Resources\KioskDemandaResource\Widgets\KioskDemandaStatsWidget;
use App\Filament\Resources\StoreSearchDemandaResource\Widgets\StoreSearchDemandaStatsWidget;
use App\Filament\Widgets\CommerceOverviewWidget;
use App\Filament\Widgets\LowStockProductsWidget;
use App\Filament\Widgets\RecentSalesWidget;
use BackedEnum;
use Filament\Pages\Dashboard as BaseDashboard;
use Filament\Support\Icons\Heroicon;

class Dashboard extends BaseDashboard
{
    protected static string | BackedEnum | null $navigationIcon = Heroicon::OutlinedSquares2x2;

    protected static ?string $navigationLabel = 'Inicio';

    protected static ?string $title = 'Panel DondeMorales';

    protected static ?int $navigationSort = -2;

    public function getWidgets(): array
    {
        $widgets = [
            CommerceOverviewWidget::class,
        ];

        if (\Illuminate\Support\Facades\Schema::hasTable('kiosk_search_logs')) {
            $widgets[] = KioskDemandaStatsWidget::class;
        }

        if (\Illuminate\Support\Facades\Schema::hasTable('store_search_logs')) {
            $widgets[] = StoreSearchDemandaStatsWidget::class;
        }

        $widgets[] = LowStockProductsWidget::class;
        $widgets[] = RecentSalesWidget::class;

        return $widgets;
    }

    public function getColumns(): int | array
    {
        return [
            'default' => 1,
            'lg' => 2,
        ];
    }
}
