<?php

namespace App\Filament\Resources\ValeDescuentoResource\Pages;

use App\Filament\Resources\Pages\ListRecords;
use App\Filament\Resources\ValeDescuentoResource;
use Filament\Actions;

class ListValeDescuentos extends ListRecords
{
    protected static string $resource = ValeDescuentoResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\CreateAction::make()];
    }
}
