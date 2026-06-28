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

            if (! empty($detalle->bundle_configuration)) {
                $bundleConfig = json_decode($detalle->bundle_configuration, true);
            }

            if (is_array($bundleConfig) && ! empty($bundleConfig['is_packaging'])) {
                if ($producto->stock_actual >= $cantidad) {
                    $producto->decrement('stock_actual', $cantidad);
                    $deducted[] = [
                        'producto' => $producto->nombre,
                        'cantidad' => $cantidad,
                        'tipo' => 'packaging',
                    ];
                }

                continue;
            }

            if (is_array($bundleConfig) && ! empty($bundleConfig['modifiers'])) {
                foreach ($bundleConfig['modifiers'] as $modifier) {
                    if (! is_array($modifier)) {
                        continue;
                    }
                    $childId = (int) ($modifier['child_product_id'] ?? 0);
                    if ($childId <= 0) {
                        continue;
                    }

                    $child = Producto::find($childId);
                    if (! $child) {
                        Log::warning("InventoryService: Child #{$childId} no encontrado");

                        continue;
                    }

                    $option = ProductBundleOption::where('parent_product_id', $producto->idproducto)
                        ->where('child_product_id', $childId)
                        ->first();
                    $qtyDeduction = ($option ? $option->quantity_deduction : 1) * $cantidad;

                    if ($child->stock_actual >= $qtyDeduction) {
                        $child->decrement('stock_actual', $qtyDeduction);
                        $deducted[] = [
                            'producto' => $child->nombre,
                            'cantidad' => $qtyDeduction,
                            'tipo' => 'bundle_child',
                        ];
                    } else {
                        Log::warning("InventoryService: Stock insuficiente {$child->nombre} (tiene {$child->stock_actual}, necesita {$qtyDeduction})");
                    }
                }

                if (! $producto->es_pack && $producto->stock_actual >= $cantidad) {
                    $producto->decrement('stock_actual', $cantidad);
                    $deducted[] = [
                        'producto' => $producto->nombre,
                        'cantidad' => $cantidad,
                        'tipo' => 'bundle_parent',
                    ];
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

            if (is_array($bundleConfig) && ! empty($bundleConfig['suggestions'])) {
                foreach ($bundleConfig['suggestions'] as $suggestion) {
                    if (! is_array($suggestion)) {
                        continue;
                    }
                    $sid = (int) ($suggestion['idproducto'] ?? 0);
                    if ($sid <= 0) {
                        continue;
                    }
                    $sProduct = Producto::find($sid);
                    if (! $sProduct) {
                        continue;
                    }
                    $sQty = $cantidad;
                    if ($sProduct->stock_actual >= $sQty) {
                        $sProduct->decrement('stock_actual', $sQty);
                        $deducted[] = [
                            'producto' => $sProduct->nombre,
                            'cantidad' => $sQty,
                            'tipo' => 'bundle_suggestion',
                        ];
                        $sProduct->increment('veces_vendido', $sQty);
                    } else {
                        Log::warning("InventoryService: Stock insuficiente sugerencia {$sProduct->nombre}");
                    }
                }
            }

            // Incrementar veces_vendido
            $producto->increment('veces_vendido', $cantidad);
        }

        Log::info("InventoryService: Venta #{$idventa} - " . count($deducted) . " items descontados", $deducted);
        return $deducted;
    }
}
