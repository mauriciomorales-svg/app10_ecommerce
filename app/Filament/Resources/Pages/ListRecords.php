<?php

namespace App\Filament\Resources\Pages;

use Filament\Resources\Pages\ListRecords as BaseListRecords;

/**
 * Filament 5: bootedInteractsWithTable corre antes de mount(); hay que inicializar la tabla en mount().
 */
abstract class ListRecords extends BaseListRecords
{
    public function mount(): void
    {
        parent::mount();

        if (! $this->shouldMountInteractsWithTable) {
            $this->mountInteractsWithTable();
            $this->bootedInteractsWithTable();
        }
    }

    public function updatingPaginators(mixed $page, string $pageName): void
    {
        $this->flushCachedTableRecords();
    }
}
