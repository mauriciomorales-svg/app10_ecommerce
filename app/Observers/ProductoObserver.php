<?php

namespace App\Observers;

use App\Models\Producto;
use App\Services\AdminAuditService;
use App\Services\ProductEmbeddingSyncService;
use Illuminate\Support\Facades\Log;

class ProductoObserver
{
    public function created(Producto $producto): void
    {
        AdminAuditService::log('created', $producto, null, $this->auditSnapshot($producto));
    }

    public function updated(Producto $producto): void
    {
        $dirty = $producto->getChanges();
        unset($dirty['updated_at']);
        if ($dirty !== []) {
            $before = [];
            foreach (array_keys($dirty) as $key) {
                $before[$key] = $producto->getOriginal($key);
            }
            AdminAuditService::log('updated', $producto, $before, $dirty);
        }

        if ($producto->isDirty('precio_costo')) {
            $packsRelacionados = $producto->perteneceAPacks;

            foreach ($packsRelacionados as $pack) {
                $nuevoCostoPack = $pack->componentes->sum(function ($comp) {
                    return $comp->precio_costo * $comp->pivot->cantidad;
                });

                if ($nuevoCostoPack >= $pack->precio) {
                    $pack->activo = false;
                    Log::warning("Pack '{$pack->nombre}' (ID:{$pack->idproducto}) desactivado: costo componentes ({$nuevoCostoPack}) >= precio venta ({$pack->precio}).");
                }

                $pack->precio_costo = $nuevoCostoPack;
                $pack->saveQuietly();
            }
        }

        if ($producto->wasChanged(['nombre', 'descripcion', 'precio', 'stock_actual', 'activo', 'idcategoria'])) {
            app(ProductEmbeddingSyncService::class)->reindex((int) $producto->idproducto);
        }
    }

    public function deleted(Producto $producto): void
    {
        AdminAuditService::log('deleted', $producto, $this->auditSnapshot($producto), null);
    }

    /**
     * @return array<string, mixed>
     */
    private function auditSnapshot(Producto $producto): array
    {
        return collect($producto->getAttributes())
            ->only([
                'nombre',
                'precio',
                'stock_actual',
                'activo',
                'es_pack',
                'builder_profile',
                'idcategoria',
            ])
            ->all();
    }
}
