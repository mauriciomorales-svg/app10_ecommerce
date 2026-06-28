<?php

namespace App\Observers;

use App\Models\Categoria;
use App\Services\AdminAuditService;

class CategoriaObserver
{
    public function created(Categoria $categoria): void
    {
        AdminAuditService::log('created', $categoria, null, $categoria->getAttributes());
    }

    public function updated(Categoria $categoria): void
    {
        $dirty = $categoria->getChanges();
        unset($dirty['updated_at']);
        if ($dirty === []) {
            return;
        }

        $before = [];
        foreach (array_keys($dirty) as $key) {
            $before[$key] = $categoria->getOriginal($key);
        }

        AdminAuditService::log('updated', $categoria, $before, $dirty);
    }

    public function deleted(Categoria $categoria): void
    {
        AdminAuditService::log('deleted', $categoria, $categoria->getOriginal(), null);
    }
}
