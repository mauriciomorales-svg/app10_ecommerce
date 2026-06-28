<?php

namespace App\Filament\Pages;

use App\Filament\Pages\RegalosKpisPage\Widgets\RegalosKpisStatsWidget;
use App\Services\RegalosKpisService;
use BackedEnum;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Schema as DbSchema;
use UnitEnum;

class RegalosKpisPage extends Page
{
    protected static string | BackedEnum | null $navigationIcon = 'heroicon-o-gift';

    protected static string | UnitEnum | null $navigationGroup = 'Tienda';

    protected static ?string $navigationLabel = 'KPIs Regalos';

    protected static ?string $title = 'KPIs Regalos 2026';

    protected static ?int $navigationSort = 3;

    protected static ?string $slug = 'kpis-regalos';

    protected string $view = 'filament.pages.regalos-kpis';

    public int $days = 7;

    public static function canAccess(): bool
    {
        return DbSchema::hasTable('commerce_events');
    }

    /**
     * @return array<string, mixed>
     */
    public function getKpis(): array
    {
        return RegalosKpisService::summary($this->days);
    }

    protected function getHeaderWidgets(): array
    {
        return [
            RegalosKpisStatsWidget::class,
        ];
    }
}
