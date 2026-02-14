<?php

namespace App\Services;

use App\Models\Producto;
use App\Models\ProductBundleOption;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryService
{
    /**
     * Descuenta stock para una venta confirmada.
     * Recorre detalle_venta y descuenta stock de:
     * - Productos individuales: decrement stock_actual
     * - Packs con bundle_configuration: decrement stock de cada child seleccionado
     * - Packs sin bundle_configuration: decrement stock de componentes base (producto_composicion)
     */
    public static function deductStockForVenta(int $idventa): array
    {
        $detalles = DB::table('detalle_venta')->where('idventa', $idventa)->get();
        $deducted = [];

        foreach ($detalles as $detalle) {
            $producto = Producto::with('componentes')->find($detalle->idproducto);
            if (!$producto) {
                Log::warning("InventoryService: Producto #{$detalle->idproducto} no encontrado para venta #{$idventa}");
                continue;
            }

            $cantidad = $detalle->cantidad;
            $bundleConfig = null;

            if (!empty($detalle->bundle_configuration)) {
                $bundleConfig = json_decode($detalle->bundle_configuration, true);
            }

            if ($producto->es_pack && $bundleConfig && !empty($bundleConfig['modifiers'])) {
                // Pack con bundle dinámico: descontar stock de cada child seleccionado
                foreach ($bundleConfig['modifiers'] as $modifier) {
                    $childId = $modifier['child_product_id'] ?? null;
                    if (!$childId) continue;

                    $child = Producto::find($childId);
                    if (!$child) {
                        Log::warning("InventoryService: Child #{$childId} no encontrado");
                        continue;
                    }

                    // Buscar quantity_deduction de la opción del bundle
                    $option = ProductBundleOption::where('parent_product_id', $producto->idproducto)
                        ->where('child_product_id', $childId)
                        ->first();
                    $qty = ($option ? $option->quantity_deduction : 1) * $cantidad;

                    if ($child->stock_actual >= $qty) {
                        $child->decrement('stock_actual', $qty);
                        $deducted[] = [
                            'producto' => $child->nombre,
                            'cantidad' => $qty,
                            'tipo' => 'bundle_child',
                        ];
                    } else {
                        Log::warning("InventoryService: Stock insuficiente {$child->nombre} (tiene {$child->stock_actual}, necesita {$qty})");
                    }
                }
            } elseif ($producto->es_pack && $producto->componentes->isNotEmpty()) {
                // Pack con componentes base (producto_composicion)
                foreach ($producto->componentes as $componente) {
                    $qty = $componente->pivot->cantidad * $cantidad;
                    if ($componente->stock_actual >= $qty) {
                        $componente->decrement('stock_actual', $qty);
                        $deducted[] = [
                            'producto' => $componente->nombre,
                            'cantidad' => $qty,
                            'tipo' => 'pack_componente',
                        ];
                    } else {
                        Log::warning("InventoryService: Stock insuficiente {$componente->nombre}");
                    }
                }
            } else {
                // Producto individual
                if ($producto->stock_actual >= $cantidad) {
                    $producto->decrement('stock_actual', $cantidad);
                    $deducted[] = [
                        'producto' => $producto->nombre,
                        'cantidad' => $cantidad,
                        'tipo' => 'individual',
                    ];
                } else {
                    Log::warning("InventoryService: Stock insuficiente {$producto->nombre}");
                }
            }

            // Incrementar veces_vendido
            $producto->increment('veces_vendido', $cantidad);
        }

        Log::info("InventoryService: Venta #{$idventa} - " . count($deducted) . " items descontados", $deducted);
        return $deducted;
    }
}
