<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
        $query = Producto::query()->with(['categorias', 'componentes', 'bundleOptions']);

        if ($request->has('categoria')) {
            $catId = $request->categoria;
            $query->whereHas('categorias', function ($q) use ($catId) {
                $q->where('categoria.idcategoria', $catId);
            });
        }

        if ($request->has('search') || $request->has('buscar')) {
            $search = $request->search ?? $request->buscar;
            $searchClean = trim($search);
            $words = preg_split('/\s+/', $searchClean);

            if (count($words) > 1) {
                $query->where(function ($q) use ($words) {
                    foreach ($words as $word) {
                        $q->orWhere('nombre', 'ilike', '%' . $word . '%');
                    }
                });
            } else {
                $query->where('nombre', 'ilike', '%' . $searchClean . '%');
            }
        }

        // Obtener códigos de barras que tienen foto en disco
        $codigosConFoto = [];
        $fotosDir = public_path('fotos_productos');
        if (is_dir($fotosDir)) {
            foreach (glob($fotosDir . '/*.{jpg,jpeg,png,webp}', GLOB_BRACE) as $file) {
                $codigosConFoto[] = pathinfo($file, PATHINFO_FILENAME);
            }
        }

        // Ordenar: primero los que tienen imagen (archivo o BD)
        if (!empty($codigosConFoto)) {
            $listaCodesBind = implode(',', array_fill(0, count($codigosConFoto), '?'));
            $query->orderByRaw(
                "CASE WHEN codigobarra IN ($listaCodesBind) OR (imagen IS NOT NULL AND length(imagen) > 0) THEN 0 ELSE 1 END ASC",
                $codigosConFoto
            );
        } else {
            $query->orderByRaw("CASE WHEN imagen IS NOT NULL AND length(imagen) > 0 THEN 0 ELSE 1 END ASC");
        }

        // Ordenamiento secundario
        if ($request->has('orden')) {
            switch ($request->orden) {
                case 'precio_menor':
                    $query->whereNotNull('precio')->where('precio', '>', 0)->orderBy('precio', 'asc');
                    break;
                case 'precio_mayor':
                    $query->whereNotNull('precio')->where('precio', '>', 0)->orderBy('precio', 'desc');
                    break;
                case 'nombre':
                    $query->orderBy('nombre', 'asc');
                    break;
                default:
                    $query->orderBy('idproducto', 'desc');
            }
        } else {
            $query->orderBy('idproducto', 'desc');
        }

        $productos = $query->paginate(24);
        
        return response()->json($productos);
    }

    public function show($id)
    {
        $producto = Producto::with([
            'categorias',
            'componentes',
            'bundleOptions.childProduct',
            'customizationFields',
        ])->findOrFail($id);

        $data = $producto->toArray();

        if ($producto->es_pack && $producto->componentes->isNotEmpty()) {
            $data['componentes'] = $producto->componentes->map(function ($comp) {
                return [
                    'idproducto' => $comp->idproducto,
                    'nombre' => $comp->nombre,
                    'cantidad_incluida' => $comp->pivot->cantidad,
                    'stock_individual' => $comp->stock_actual,
                ];
            });
            $data['mensaje_stock'] = $producto->stock_disponible <= 10 && $producto->stock_disponible > 0
                ? "¡Solo quedan {$producto->stock_disponible} packs disponibles!"
                : null;
        }

        // Bundle options agrupadas por group_name
        if ($producto->bundleOptions->isNotEmpty()) {
            $data['bundle_groups'] = $producto->bundleOptions
                ->groupBy('group_name')
                ->map(function ($options, $groupName) {
                    $first = $options->first();
                    return [
                        'group_name' => $groupName,
                        'input_type' => $first->input_type,
                        'is_required' => $first->is_required,
                        'options' => $options->map(function ($opt) {
                            $child = $opt->childProduct;
                            return [
                                'id' => $opt->id,
                                'child_product_id' => $opt->child_product_id,
                                'nombre' => $child ? $child->nombre : 'Producto eliminado',
                                'imagen_url' => $child ? $child->imagen_url : null,
                                'precio' => $opt->price_modifier !== null
                                    ? (float) $opt->price_modifier
                                    : ($child ? (float) $child->precio : 0),
                                'stock_disponible' => $child ? $child->stock_disponible : 0,
                            ];
                        })->values(),
                    ];
                })->values();
        }

        // Campos de personalización
        if ($producto->customizationFields->isNotEmpty()) {
            $data['customization_fields'] = $producto->customizationFields->map(function ($field) {
                return [
                    'id' => $field->id,
                    'label' => $field->label,
                    'field_key' => $field->field_key,
                    'field_type' => $field->field_type,
                    'is_required' => $field->is_required,
                    'extra_cost' => (float) $field->extra_cost,
                    'options' => $field->options,
                ];
            });
        }

        return response()->json($data);
    }

    public function destacados()
    {
        $productos = Producto::where('stock_actual', '>', 0)
            ->orderBy('veces_vendido', 'desc')
            ->take(8)
            ->get();
        return response()->json($productos);
    }

    public function imagen($id)
    {
        $producto = Producto::select('idproducto', 'imagen')->find($id);
        if (!$producto || !$producto->getAttributes()['imagen']) {
            abort(404);
        }
        $img = $producto->getAttributes()['imagen'];
        $data = is_resource($img) ? stream_get_contents($img) : $img;
        if (!$data) abort(404);

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->buffer($data) ?: 'image/jpeg';

        return response($data, 200)
            ->header('Content-Type', $mime)
            ->header('Cache-Control', 'public, max-age=86400');
    }

    public function categorias()
    {
        $categorias = \App\Models\Categoria::orderBy('nombre')->get();
        return response()->json($categorias);
    }
}
