<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class ProductSuggestionController extends Controller
{
    public function index($productoId)
    {
        $sugerencias = DB::table('producto_sugerencias as ps')
            ->join('productos as p', 'ps.producto_sugerido_id', '=', 'p.idproducto')
            ->where('ps.producto_origen_id', $productoId)
            ->where('ps.activo', true)
            ->orderBy('ps.orden')
            ->select(
                'p.idproducto',
                'p.nombre',
                'p.precio',
                'p.stock_actual as stock',
                'ps.mensaje',
                'ps.tipo'
            )
            ->get();

        // Agregar imagen_url a cada producto
        foreach ($sugerencias as $s) {
            $s->imagen_url = $this->getImagenUrl($s->idproducto);
            $s->precio_venta = (float) $s->precio;
        }

        return response()->json($sugerencias);
    }

    private function getImagenUrl($idproducto)
    {
        $producto = DB::table('productos')->where('idproducto', $idproducto)->first();
        if (!$producto) return null;

        $codigo = $producto->codigobarra ?? null;
        if ($codigo) {
            foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
                $path = public_path("fotos_productos/{$codigo}.{$ext}");
                if (file_exists($path)) {
                    return "/fotos_productos/{$codigo}.{$ext}";
                }
            }
        }

        // Verificar si tiene imagen en BD
        if (!empty($producto->imagen)) {
            return "/api/productos/{$idproducto}/imagen";
        }

        return null;
    }
}
