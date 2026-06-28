<?php

namespace App\Filament\Resources\ProductoResource\Pages;

use App\Filament\Resources\ProductoResource;
use App\Filament\Resources\ProductoResource\Concerns\SyncsProductIntegrations;
use Filament\Resources\Pages\CreateRecord;

class CreateProducto extends CreateRecord
{
    use SyncsProductIntegrations;

    protected static string $resource = ProductoResource::class;

    public function mount(): void
    {
        parent::mount();

        $nombre = trim((string) request()->query('nombre', ''));
        if ($nombre !== '') {
            $this->form->fill([
                'nombre' => mb_substr($nombre, 0, 255),
            ]);
        }
    }

    protected function afterCreate(): void
    {
        $this->syncIntegrations();
    }
}
