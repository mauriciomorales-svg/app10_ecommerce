<?php



namespace App\Filament\Resources\ProductoResource\Concerns;



use App\Models\Producto;

use App\Services\ProductEmbeddingSyncService;



trait SyncsProductIntegrations

{

    protected function syncIntegrations(): void

    {

        /** @var Producto $record */

        $record = $this->record->fresh(['categorias']);



        if ($record->categorias()->exists() && ! $record->idcategoria) {

            $record->updateQuietly(['idcategoria' => $record->categorias()->first()->idcategoria]);

        }



        app(ProductEmbeddingSyncService::class)->reindex((int) $record->idproducto);

    }

}

