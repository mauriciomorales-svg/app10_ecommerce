<?php

namespace App\Filament\Resources\KioskDemandaResource\Pages;

use App\Filament\Resources\KioskDemandaResource;
use Filament\Resources\Pages\ListRecords;

class ListKioskDemanda extends ListRecords
{
    protected static string $resource = KioskDemandaResource::class;

    protected function getHeaderWidgets(): array
    {
        return [
            KioskDemandaResource\Widgets\KioskDemandaStatsWidget::class,
            KioskDemandaResource\Widgets\TopDemandaNoEncontradaWidget::class,
        ];
    }
}
