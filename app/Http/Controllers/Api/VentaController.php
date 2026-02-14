<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Venta;
use App\Models\DetalleVenta;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VentaController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.idproducto' => 'required|exists:productos,idproducto',
            'items.*.cantidad' => 'required|integer|min:1',
            'tipo_pago' => 'required|string',
        ]);

        return DB::transaction(function () use ($request) {
            // Crear la venta
            $venta = Venta::create([
                'idcliente' => $request->idcliente ?? null,
                'idtrabajador' => $request->idtrabajador ?? null,
                'tipo_comprobante' => 'Boleta',
                'serie_comprobante' => 'B001',
                'num_comprobante' => $this->generarNumeroComprobante(),
                'fecha_hora' => now(),
                'impuesto' => 0,
                'total_venta' => 0,
                'estado' => 'activo',
                'tipo_pago' => $request->tipo_pago,
            ]);

            $total = 0;

            // Crear detalles de venta
            foreach ($request->items as $item) {
                $producto = Producto::with('componentes')->findOrFail($item['idproducto']);
                $cantidadVenta = $item['cantidad'];

                if ($producto->es_pack) {
                    // Verificar stock de cada componente
                    foreach ($producto->componentes as $componente) {
                        $cantidadADescontar = $componente->pivot->cantidad * $cantidadVenta;
                        if ($componente->stock_actual < $cantidadADescontar) {
                            throw new \Exception("Stock insuficiente de: {$componente->nombre} (necesita {$cantidadADescontar}, tiene {$componente->stock_actual})");
                        }
                    }
                    // Descontar stock de cada componente
                    foreach ($producto->componentes as $componente) {
                        $cantidadADescontar = $componente->pivot->cantidad * $cantidadVenta;
                        $componente->decrement('stock_actual', $cantidadADescontar);
                    }
                } else {
                    // Producto individual
                    if ($producto->stock < $cantidadVenta) {
                        throw new \Exception("Stock insuficiente para: {$producto->nombre}");
                    }
                    $producto->decrement('stock_actual', $cantidadVenta);
                }

                $subtotal = $cantidadVenta * $producto->precio_venta;
                
                DetalleVenta::create([
                    'idventa' => $venta->idventa,
                    'idproducto' => $item['idproducto'],
                    'cantidad' => $cantidadVenta,
                    'precio_venta' => $producto->precio_venta,
                    'descuento' => 0,
                ]);

                $producto->increment('veces_vendido', $cantidadVenta);
                $total += $subtotal;
            }

            // Actualizar total de venta
            $venta->update(['total_venta' => $total]);

            return response()->json([
                'message' => 'Venta creada exitosamente',
                'venta' => $venta->load('detalles.producto'),
            ], 201);
        });
    }

    private function generarNumeroComprobante()
    {
        $ultima = Venta::where('serie_comprobante', 'B001')->orderBy('idventa', 'desc')->first();
        $numero = $ultima ? intval($ultima->num_comprobante) + 1 : 1;
        return str_pad($numero, 6, '0', STR_PAD_LEFT);
    }
}
