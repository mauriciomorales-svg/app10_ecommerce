<?php

namespace App\Filament\Resources\StoreSearchDemandaResource\Pages;

use App\Filament\Resources\StoreSearchDemandaResource;
use Filament\Resources\Pages\ListRecords;

class ListStoreSearchDemanda extends ListRecords
{
    protected static string $resource = StoreSearchDemandaResource::class;

    protected function getHeaderWidgets(): array
    {
        return [
            StoreSearchDemandaResource\Widgets\StoreSearchDemandaStatsWidget::class,
            StoreSearchDemandaResource\Widgets\TopStoreSearchNoResultadoWidget::class,
        ];
    }
}
