<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Producto;
use App\Services\ProductImageUrlService;
use App\Support\CurrentCommerceStore;
use App\Support\CustomizationFieldOptions;
use App\Support\CommerceStoreSettings;
use App\Services\ProductBuilderProfileService;
use App\Support\ProductBuilderFlags;
use App\Services\ProductSearchService;
use App\Services\StoreSearchLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class ProductoController extends Controller
{
    public function __construct(
        private ProductSearchService $searchService,
        private StoreSearchLogService $storeSearchLog,
    ) {}

    public function index(Request $request)
    {
        $query = Producto::query()->with(['categorias', 'componentes', 'bundleOptions']);

        if (Schema::hasColumn('productos', 'activo')) {
            $query->where('activo', true);
        }

        CommerceStoreSettings::applyCatalogScope($query);

        if ($request->has('categoria')) {
            $catId = (int) $request->categoria;
            $query->where(function ($q) use ($catId) {
                $q->whereHas('categorias', function ($sub) use ($catId) {
                    $sub->where('categoria.idcategoria', $catId);
                });
                if (Schema::hasColumn('productos', 'idcategoria')) {
                    $q->orWhere('idcategoria', $catId);
                }
            });
        }

        /** Solo productos “experiencia” (padres/combos/yogen), no modifiers sueltos en menú helados */
        if ($request->boolean('experiencia')) {
            $query->where(function ($q) {
                $q->where('codigobarra', 'like', 'TOPPI-PARENT-%')
                    ->orWhere('codigobarra', 'like', 'TOPPI-COMBO-%')
                    ->orWhere('codigobarra', 'like', 'TOPPI-YOGEN-%');
            })->where('codigobarra', '!=', 'TOPPI-PARENT-HELADO');
        }

        if ($request->filled('alcance')) {
            $this->searchService->applyAlcance($query, (string) $request->alcance);
        }

        $searchRaw = trim((string) ($request->search ?? $request->buscar ?? ''));
        if ($searchRaw !== '') {
            $this->searchService->applyTextSearch($query, $searchRaw);
            $this->searchService->orderByRelevance($query, $searchRaw);
        }

        // Obtener nombres de archivo en fotos_productos (codigobarra o idproducto legacy)
        $stemsConFoto = ProductImageUrlService::photoStemsOnDisk();

        // Ordenar: primero los que tienen imagen (archivo o BD)
        if ($stemsConFoto !== []) {
            $listaCodesBind = implode(',', array_fill(0, count($stemsConFoto), '?'));
            $query->orderByRaw(
                "CASE WHEN codigobarra IN ($listaCodesBind) OR CAST(idproducto AS TEXT) IN ($listaCodesBind) OR (imagen IS NOT NULL AND length(imagen) > 0) THEN 0 ELSE 1 END ASC",
                array_merge($stemsConFoto, $stemsConFoto)
            );
        } else {
            $query->orderByRaw('CASE WHEN imagen IS NOT NULL AND length(imagen) > 0 THEN 0 ELSE 1 END ASC');
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

        if ($searchRaw !== '' && (int) $request->input('page', 1) <= 1) {
            $this->storeSearchLog->log(
                query: $searchRaw,
                scope: $this->storeSearchLog->normalizeScope($request->input('alcance')),
                totalResults: (int) $productos->total(),
                sessionId: $request->input('session_id') ? (string) $request->input('session_id') : null,
                page: $request->input('page_path') ? (string) $request->input('page_path') : null,
            );
        }

        // Flags para abrir el builder (variantes, personalización, packs o upsell)
        $ids = $productos->pluck('idproducto')->toArray();
        $needsBuilder = ProductBuilderFlags::idsNeedingBuilder($ids);
        $withCustomization = ProductBuilderFlags::idsWithCustomization($ids);

        $productos->getCollection()->transform(function ($p) use ($needsBuilder, $withCustomization) {
            $id = (int) $p->idproducto;
            $p->has_bundle_options = isset($needsBuilder[$id]) || (bool) $p->es_pack;
            $p->has_customization = isset($withCustomization[$id]);
            return $p;
        });

        return response()->json($productos);
    }

    public function suggest(Request $request)
    {
        $q = trim((string) ($request->q ?? $request->buscar ?? ''));
        if (mb_strlen($q) < 2) {
            return response()->json(['suggestions' => []]);
        }

        $query = Producto::query()->with(['categorias']);

        if (Schema::hasColumn('productos', 'activo')) {
            $query->where('activo', true);
        }

        CommerceStoreSettings::applyCatalogScope($query);

        if ($request->filled('alcance')) {
            $this->searchService->applyAlcance($query, (string) $request->alcance);
        }

        if ($request->boolean('experiencia')) {
            $query->where(function ($sub) {
                $sub->where('codigobarra', 'like', 'TOPPI-PARENT-%')
                    ->orWhere('codigobarra', 'like', 'TOPPI-COMBO-%')
                    ->orWhere('codigobarra', 'like', 'TOPPI-YOGEN-%');
            })->where('codigobarra', '!=', 'TOPPI-PARENT-HELADO');
        }

        $this->searchService->applyTextSearch($query, $q);
        $this->searchService->orderByRelevance($query, $q);

        $rows = $query
            ->orderByDesc('veces_vendido')
            ->limit(8)
            ->get(['idproducto', 'nombre', 'precio', 'imagen', 'codigobarra', 'es_pack']);

        $suggestions = $rows->map(function (Producto $p) {
            $cat = $p->categorias->first();

            return [
                'idproducto' => (int) $p->idproducto,
                'nombre' => $p->nombre,
                'precio' => $p->precio ? (int) round((float) $p->precio) : null,
                'imagen_url' => $p->imagen_url ?? null,
                'categoria' => $cat?->nombre,
                'es_pack' => (bool) $p->es_pack,
            ];
        });

        return response()->json(['suggestions' => $suggestions]);
    }

    public function show($id)
    {
        $productoQuery = Producto::with([
            'categorias',
            'componentes',
            'bundleOptions.childProduct',
            'customizationFields',
        ]);

        if (Schema::hasColumn('productos', 'activo')) {
            $productoQuery->where('activo', true);
        }

        $producto = $productoQuery->findOrFail($id);

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

        $builderPayload = ProductBuilderProfileService::builderPayload($producto);
        $data = array_merge($data, $builderPayload);

        if ($producto->bundleOptions->isNotEmpty()) {
            $data['bundle_groups'] = ProductBuilderProfileService::formatBundleGroups(
                $producto,
                (string) $builderPayload['builder_profile'],
                (bool) $builderPayload['is_combo_product']
            );
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
                    'options' => ['values' => CustomizationFieldOptions::valuesForFrontend($field->options)],
                ];
            });
        }

        return response()->json($data);
    }

    public function destacados()
    {
        $pinned = $this->resolvePinnedDestacadoIds();
        $limit = 8;

        $pinnedProducts = collect();
        if ($pinned !== []) {
            $pinnedProducts = Producto::with('categorias')
                ->whereIn('idproducto', $pinned)
                ->where('stock_actual', '>', 0)
                ->when(Schema::hasColumn('productos', 'activo'), fn ($q) => $q->where('activo', true))
                ->get()
                ->sortBy(fn ($p) => array_search((int) $p->idproducto, $pinned, true))
                ->values();
        }

        $remaining = max(0, $limit - $pinnedProducts->count());
        $filler = collect();
        if ($remaining > 0) {
            $exclude = $pinnedProducts->pluck('idproducto')->all();
            $filler = Producto::with('categorias')
                ->where('stock_actual', '>', 0)
                ->when(Schema::hasColumn('productos', 'activo'), fn ($q) => $q->where('activo', true))
                ->when($exclude !== [], fn ($q) => $q->whereNotIn('idproducto', $exclude))
                ->orderByDesc('veces_vendido')
                ->take($remaining)
                ->get();
        }

        $productos = $pinnedProducts->concat($filler)->take($limit);

        $ids = $productos->pluck('idproducto')->toArray();
        $needsBuilder = ProductBuilderFlags::idsNeedingBuilder($ids);
        $withCustomization = ProductBuilderFlags::idsWithCustomization($ids);

        $productos->transform(function ($p) use ($needsBuilder, $withCustomization) {
            $id = (int) $p->idproducto;
            $p->has_bundle_options = isset($needsBuilder[$id]) || (bool) $p->es_pack;
            $p->has_customization = isset($withCustomization[$id]);

            return $p;
        });

        return response()->json($productos->values());
    }

    /**
     * IDs fijados + resolución por nombre (Toppi's u otros tras seed).
     *
     * @return int[]
     */
    private function resolvePinnedDestacadoIds(): array
    {
        $settings = CommerceStoreSettings::get();
        $skus = array_filter((array) ($settings['destacados_skus'] ?? []));
        if ($skus !== []) {
            $storeId = CurrentCommerceStore::id();
            $q = Producto::query()->whereIn('codigobarra', $skus)->where('stock_actual', '>', 0);
            if (Schema::hasColumn('productos', 'activo')) {
                $q->where('activo', true);
            }
            if ($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id')) {
                $q->where('commerce_store_id', $storeId);
            }
            $bySku = $q->pluck('idproducto', 'codigobarra');
            $fromSkus = [];
            foreach ($skus as $sku) {
                $id = (int) ($bySku[$sku] ?? 0);
                if ($id > 0) {
                    $fromSkus[] = $id;
                }
            }
            if ($fromSkus !== []) {
                return $fromSkus;
            }
        }

        $ids = array_values(array_unique(array_map(
            'intval',
            (array) config('commerce_showcase.pinned_destacados', [])
        )));

        $names = array_filter((array) config('commerce_showcase.pinned_destacados_nombres', []));
        if ($names !== []) {
            $byName = Producto::query()
                ->whereIn('nombre', $names)
                ->where('stock_actual', '>', 0)
                ->when(Schema::hasColumn('productos', 'activo'), fn ($q) => $q->where('activo', true))
                ->pluck('idproducto', 'nombre');

            $fromNames = [];
            foreach ($names as $nombre) {
                $id = (int) ($byName[$nombre] ?? 0);
                if ($id > 0) {
                    $fromNames[] = $id;
                }
            }
            $ids = array_merge($fromNames, $ids);
        }

        return array_values(array_unique(array_filter($ids, fn ($id) => $id > 0)));
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
        $q = Categoria::query()->orderBy('nombre');
        $storeId = CurrentCommerceStore::id();

        $q->where(function ($outer) use ($storeId) {
            $outer->whereHas('productos', function ($sub) use ($storeId) {
                $sub->where('stock_actual', '>', 0);
                if (Schema::hasColumn('productos', 'activo')) {
                    $sub->where('productos.activo', true);
                }
                if ($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id')) {
                    $sub->where('productos.commerce_store_id', $storeId);
                }
                CommerceStoreSettings::applyCatalogScope($sub);
            });
            if (Schema::hasTable('producto_categoria')) {
                $outer->orWhereHas('productosPivot', function ($sub) use ($storeId) {
                    $sub->where('stock_actual', '>', 0);
                    if (Schema::hasColumn('productos', 'activo')) {
                        $sub->where('productos.activo', true);
                    }
                    if ($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id')) {
                        $sub->where('productos.commerce_store_id', $storeId);
                    }
                    CommerceStoreSettings::applyCatalogScope($sub);
                });
            }
        });

        if (CommerceStoreSettings::isJobshours()) {
            $q->where('nombre', 'not like', '%intern%');
        }

        return response()->json($q->get());
    }
}
