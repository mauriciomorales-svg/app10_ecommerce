<?php

namespace App\Filament\Resources\ValeDescuentoResource\Pages;

use App\Filament\Resources\ValeDescuentoResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditValeDescuento extends EditRecord
{
    protected static string $resource = ValeDescuentoResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\DeleteAction::make()];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['codigo'] = strtoupper(trim((string) ($data['codigo'] ?? '')));

        return $data;
    }
}
