<?php

namespace App\Observers;

use App\Models\Producto;
use Illuminate\Support\Facades\Log;

class ProductoObserver
{
    public function updated(Producto $producto)
    {
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
    }
}
