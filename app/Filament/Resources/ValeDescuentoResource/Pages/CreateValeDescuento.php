<?php

namespace App\Filament\Resources\ValeDescuentoResource\Pages;

use App\Filament\Resources\ValeDescuentoResource;
use Filament\Resources\Pages\CreateRecord;

class CreateValeDescuento extends CreateRecord
{
    protected static string $resource = ValeDescuentoResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['codigo'] = strtoupper(trim((string) ($data['codigo'] ?? '')));

        return $data;
    }
}
