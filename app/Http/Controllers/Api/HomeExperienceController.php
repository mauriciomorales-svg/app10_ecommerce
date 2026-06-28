<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Services\HeladosToppisDelDiaService;
use App\Services\ProductBuilderProfileService;
use App\Support\ProductBuilderFlags;
use Illuminate\Support\Facades\DB;

class HomeExperienceController extends Controller
{
    /**
     * GET /api/tienda/experiencias-home
     * Bloques helados Toppi's, regalos, comida salada y empaques para la portada.
     */
    public function index()
    {
        $packaging = config('packaging', []);

        return response()->json([
            'helados_combos' => $this->heladosCombosBlock(),
            'regalos_destacados' => $this->regalosDestacadosBlock(),
            'packs_tarjetas_premium' => $this->packsTarjetasPremiumBlock(),
            'packs_reserva' => $this->packsReservaBlock(),
            'salada_destacados' => $this->saladaDestacadosBlock(),
            'toppis' => $this->block('toppis'),
            'regalos' => $this->block('regalos'),
            'salada' => $this->block('salada'),
            'platos_listos' => $this->block('platos_listos'),
            'empaques' => [
                'titulo' => config('home_experience.empaques.titulo', 'Empaque'),
                'items' => config('home_experience.empaques.items', []),
                'free_reinforced_from' => (int) ($packaging['free_reinforced_from'] ?? 10000),
                'free_gift_box_from' => (int) ($packaging['free_gift_box_from'] ?? 25000),
                'gift_box_label' => $packaging['options']['gift_box']['label'] ?? 'Caja regalo',
            ],
            'delivery_renaico' => (array) config('delivery_renaico', []),
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * @return array<string, mixed>
     */
    private function heladosCombosBlock(): array
    {
        $cfg = (array) config('helados_combos', []);
        $resolve = function (array $items) {
            $nombres = array_column($items, 'nombre');
            $productos = collect();
            if ($nombres !== []) {
                $productos = Producto::query()
                    ->with(['categorias', 'bundleOptions', 'customizationFields'])
                    ->whereIn('nombre', $nombres)
                    ->where('activo', true)
                    ->get()
                    ->keyBy('nombre');
            }

            return array_map(function (array $item) use ($productos) {
                $p = $productos->get($item['nombre'] ?? '');
                $imagenCfg = $item['imagen'] ?? null;

                return array_merge($item, [
                    'idproducto' => $p ? (int) $p->idproducto : null,
                    'precio_desde' => $p ? (int) round((float) $p->precio) : null,
                    'imagen_url' => $imagenCfg ?: $p?->imagen_url,
                ], $this->enrichQuickAddFields($p));
            }, $items);
        };

        $yogenNombre = (string) ($cfg['yogen']['nombre'] ?? 'Helado de yogurt');
        $yogen = Producto::query()
            ->where('activo', true)
            ->where(function ($q) use ($yogenNombre) {
                $q->where('nombre', $yogenNombre)
                    ->orWhere('nombre', 'Helado de yogurt')
                    ->orWhere('nombre', 'Yogurt con fruta')
                    ->orWhere('nombre', 'Yogen Mix Frutal')
                    ->orWhere('codigobarra', 'TOPPI-YOGEN-MIX-MED');
            })
            ->first();

        $softNombre = (string) ($cfg['soft']['nombre'] ?? 'Soft Toppi\'s');
        $soft = Producto::query()
            ->where('activo', true)
            ->where(function ($q) use ($softNombre) {
                $q->where('nombre', $softNombre)
                    ->orWhere('nombre', 'Soft Toppi\'s')
                    ->orWhere('nombre', 'Arma tu Soft Toppi\'s')
                    ->orWhere('codigobarra', 'TOPPI-SOFT-PARENT');
            })
            ->first();

        $artesanalNombre = (string) ($cfg['artesanal']['nombre'] ?? 'Artesanal Toppi\'s');
        $artesanal = Producto::query()
            ->where('activo', true)
            ->where(function ($q) use ($artesanalNombre) {
                $q->where('nombre', $artesanalNombre)
                    ->orWhere('nombre', 'Artesanal Toppi\'s')
                    ->orWhere('nombre', 'Arma tu Artesanal Toppi\'s')
                    ->orWhere('codigobarra', 'TOPPI-ARTESANAL-PARENT');
            })
            ->first();

        $combosCfg = (array) ($cfg['combos'] ?? []);
        $rotativosCfg = (array) ($cfg['combos_rotativos'] ?? []);
        $combosResolved = $resolve($combosCfg);
        $rotativosResolved = $resolve($rotativosCfg);
        $todosCombosCfg = array_merge($combosCfg, $rotativosCfg);
        $promoCfg = (array) ($cfg['combo_semana'] ?? []);
        $weekIdx = $todosCombosCfg !== [] ? (int) now()->isoWeek() % count($todosCombosCfg) : 0;
        $comboSemanaNombre = (string) ($todosCombosCfg[$weekIdx]['nombre'] ?? '');
        $comboSemana = null;
        foreach (array_merge($combosResolved, $rotativosResolved) as $c) {
            if (($c['nombre'] ?? '') === $comboSemanaNombre) {
                $comboSemana = $c;
                break;
            }
        }

        $yogenCfg = (array) ($cfg['yogen'] ?? []);
        $catNombre = (string) ($cfg['categoria_nombre'] ?? 'Helados Toppi\'s');
        $categoriaId = DB::table('categoria')->where('nombre', $catNombre)->value('idcategoria');
        if ($categoriaId === null) {
            $categoriaId = (int) ($cfg['categoria_id'] ?? 24);
        }

        return [
            'title' => $cfg['title'] ?? 'Combos Estrella',
            'tagline' => $cfg['tagline'] ?? '',
            'subtitle' => $cfg['subtitle'] ?? '',
            'categoria_id' => (int) $categoriaId,
            'categoria_nombre' => $cfg['categoria_nombre'] ?? 'Helados Toppi\'s',
            'combos' => $combosResolved,
            'combos_rotativos' => $rotativosResolved,
            'combo_semana' => array_merge($promoCfg, [
                'combo' => $comboSemana,
                'promo_activa' => $this->heladosPromoActiva($promoCfg),
            ]),
            'yogen' => array_merge($yogenCfg, [
                'idproducto' => $yogen ? (int) $yogen->idproducto : null,
                'precio_desde' => $yogen ? (int) round((float) $yogen->precio) : null,
                'imagen_url' => ($yogenCfg['imagen'] ?? null) ?: $yogen?->imagen_url,
                'badge' => $yogenCfg['badge'] ?? null,
            ]),
            'soft' => array_merge((array) ($cfg['soft'] ?? []), [
                'idproducto' => $soft ? (int) $soft->idproducto : null,
                'precio_desde' => $soft ? (int) round((float) $soft->precio) : (int) (($cfg['soft']['precios'][0] ?? 1000)),
            ]),
            'artesanal' => array_merge((array) ($cfg['artesanal'] ?? []), [
                'idproducto' => $artesanal ? (int) $artesanal->idproducto : null,
                'precio_desde' => $artesanal ? (int) round((float) $artesanal->precio) : (int) (($cfg['artesanal']['precios'][0] ?? 2000)),
            ]),
            'toppis_del_dia' => HeladosToppisDelDiaService::block(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    /**
     * @return array<string, mixed>
     */
    private function packsTarjetasPremiumBlock(): array
    {
        $cfg = (array) config('packs_tarjetas_premium', []);
        $masPedidos = array_flip((array) config('regalos_experiencia.mas_pedidos', []));

        $tarjetas = array_map(function (array $item) use ($masPedidos) {
            $nombre = (string) ($item['nombre'] ?? '');
            $id = $this->resolvePackProductIdByNombre($nombre);
            $p = $id > 0
                ? Producto::query()->where('idproducto', $id)->where('activo', true)->first()
                : null;
            $contenido = $id > 0 ? $this->packEnrichment($id) : [
                'siempre_incluye' => [],
                'tu_eliges' => [],
                'modalidad_tecnica' => null,
                'componentes_preview' => [],
            ];

            return array_merge($item, [
                'idproducto' => $id > 0 ? $id : null,
                'precio' => $p ? (int) round((float) $p->precio) : null,
                'imagen_url' => $item['imagen'] ?? $p?->imagen_url,
                'siempre_incluye' => $contenido['siempre_incluye'],
                'modalidad_tecnica' => $contenido['modalidad_tecnica'],
                'componentes_preview' => $contenido['componentes_preview'],
                'mas_pedido' => isset($masPedidos[$nombre]),
            ]);
        }, (array) ($cfg['tarjetas'] ?? []));

        return [
            'title' => $cfg['title'] ?? 'Packs regalo',
            'tagline' => $cfg['tagline'] ?? '',
            'dia_padre' => (array) ($cfg['dia_padre'] ?? []),
            'dia_padre_comida' => (array) ($cfg['dia_padre_comida'] ?? []),
            'cocina_casa_facebook' => (array) ($cfg['cocina_casa_facebook'] ?? []),
            'tarjetas' => $tarjetas,
        ];
    }

    private function regalosDestacadosBlock(): array
    {
        $cfg = (array) config('regalos_destacados', []);
        $nombres = array_column((array) ($cfg['destacados'] ?? []), 'nombre');
        $productos = collect();
        if ($nombres !== []) {
            $productos = Producto::query()
                ->with(['bundleOptions', 'customizationFields'])
                ->whereIn('nombre', $nombres)
                ->where('activo', true)
                ->get()
                ->keyBy('nombre');
        }

        $masPedidos = array_flip((array) config('regalos_experiencia.mas_pedidos', []));

        $destacados = array_map(function (array $item) use ($productos, $masPedidos) {
            $p = $productos->get($item['nombre'] ?? '');
            $imagenCfg = $item['imagen'] ?? null;
            $id = $p ? (int) $p->idproducto : 0;
            $contenido = $id > 0 ? $this->packEnrichment($id) : [
                'siempre_incluye' => (array) ($item['siempre_incluye'] ?? []),
                'tu_eliges' => [],
                'modalidad_tecnica' => null,
                'componentes_preview' => [],
            ];
            $cfgFijos = (array) ($item['siempre_incluye'] ?? []);
            $siempre = $contenido['siempre_incluye'] !== []
                ? $contenido['siempre_incluye']
                : $cfgFijos;
            $hasBundle = $id > 0 && isset(ProductBuilderFlags::idsNeedingBuilder([$id])[$id]);
            $quick = $this->enrichQuickAddFields($p);

            return array_merge($item, [
                'idproducto' => $id > 0 ? $id : null,
                'precio_desde' => $p ? (int) round((float) $p->precio) : null,
                'imagen_url' => $imagenCfg ?: $p?->imagen_url,
                'siempre_incluye' => $siempre,
                'tu_eliges' => $contenido['tu_eliges'],
                'modalidad_tecnica' => $contenido['modalidad_tecnica'],
                'componentes_preview' => $contenido['componentes_preview'],
                'has_bundle_options' => $hasBundle && ! $quick['quick_add'],
                'mas_pedido' => isset($masPedidos[(string) ($item['nombre'] ?? '')]),
            ], $quick);
        }, (array) ($cfg['destacados'] ?? []));

        return [
            'title' => $cfg['title'] ?? 'Regalos',
            'tagline' => $cfg['tagline'] ?? '',
            'subtitle' => $cfg['subtitle'] ?? '',
            'mensaje_personalizable' => $cfg['mensaje_personalizable'] ?? '',
            'flujo' => (array) ($cfg['flujo'] ?? []),
            'ocasiones' => (array) ($cfg['ocasiones'] ?? []),
            'corporativo' => (array) ($cfg['corporativo'] ?? []),
            'confianza' => (array) ($cfg['confianza'] ?? []),
            'destacados' => $destacados,
            'categorias' => $this->resolveCategoriasFromConfig($cfg),
            'experiencia' => $this->regalosExperienciaBlock(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function regalosExperienciaBlock(): array
    {
        $cfg = (array) config('regalos_experiencia', []);

        $comparePacks = array_map(function (array $row) {
            $nombre = (string) ($row['nombre'] ?? '');
            $id = $this->resolvePackProductIdByNombre($nombre);
            $p = $id > 0
                ? Producto::query()->where('idproducto', $id)->where('activo', true)->first()
                : null;
            $contenido = $id > 0 ? $this->packEnrichment($id) : ['siempre_incluye' => []];

            return array_merge($row, [
                'idproducto' => $id > 0 ? $id : null,
                'precio' => $p ? (int) round((float) $p->precio) : null,
                'siempre_incluye' => array_slice($contenido['siempre_incluye'] ?? [], 0, 4),
            ]);
        }, (array) ($cfg['compare']['packs'] ?? []));

        $upsellItems = array_map(function (array $row) {
            $nombre = (string) ($row['nombre'] ?? '');
            $p = Producto::query()
                ->where('nombre', 'like', '%'.$nombre.'%')
                ->where('activo', true)
                ->where('venta_web', true)
                ->orderByDesc('idproducto')
                ->first();

            if (! $p && str_contains($nombre, 'Globo')) {
                $p = Producto::query()
                    ->where('nombre', 'like', '%globo%')
                    ->where('activo', true)
                    ->where('venta_web', true)
                    ->orderByDesc('idproducto')
                    ->first();
            }

            return array_merge($row, [
                'idproducto' => $p ? (int) $p->idproducto : null,
                'nombre_producto' => $p?->nombre,
                'precio' => $p ? (int) round((float) $p->precio) : null,
                'imagen_url' => $p?->imagen_url,
            ]);
        }, (array) ($cfg['checkout_upsell']['items'] ?? []));

        return [
            'retiro' => (array) ($cfg['retiro'] ?? []),
            'mas_pedidos' => (array) ($cfg['mas_pedidos'] ?? []),
            'quiz' => (array) ($cfg['quiz'] ?? []),
            'compare' => array_merge((array) ($cfg['compare'] ?? []), ['packs' => $comparePacks]),
            'checkout_upsell' => array_merge((array) ($cfg['checkout_upsell'] ?? []), ['items' => $upsellItems]),
            'comida_porciones' => (array) ($cfg['comida_porciones'] ?? []),
            'corporativo_form' => (array) ($cfg['corporativo_form'] ?? []),
            'prueba_social' => (array) ($cfg['prueba_social'] ?? []),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function packsReservaBlock(): array
    {
        $cfg = (array) config('packs_reserva', []);

        $heladosListos = array_map(function (array $item) {
            $nombreBd = (string) ($item['nombre'] ?? '');
            $id = $this->resolvePackProductIdByNombre($nombreBd);
            $p = $id > 0
                ? Producto::query()->with(['bundleOptions', 'customizationFields'])->where('idproducto', $id)->where('activo', true)->first()
                : null;

            return array_merge($item, [
                'idproducto' => $id > 0 ? $id : null,
                'precio_desde' => $p ? (int) round((float) $p->precio) : null,
                'imagen_url' => $item['imagen'] ?? $p?->imagen_url,
            ], $this->enrichQuickAddFields($p));
        }, (array) ($cfg['helados_listos'] ?? []));

        $regalosCerrados = array_map(function (array $item) {
            $nombreBd = (string) ($item['nombre'] ?? '');
            $id = $this->resolvePackProductIdByNombre($nombreBd);
            $p = $id > 0
                ? Producto::query()->with(['bundleOptions', 'customizationFields', 'componentes'])->where('idproducto', $id)->where('activo', true)->first()
                : null;

            $contenido = $id > 0 ? $this->packEnrichment($id) : ['siempre_incluye' => []];

            return array_merge($item, [
                'idproducto' => $id > 0 ? $id : null,
                'precio_desde' => $p ? (int) round((float) $p->precio) : null,
                'imagen_url' => $item['imagen'] ?? $p?->imagen_url,
                'siempre_incluye' => $contenido['siempre_incluye'],
                'componentes_preview' => $contenido['componentes_preview'] ?? [],
            ], $this->enrichQuickAddFields($p));
        }, (array) ($cfg['regalos_cerrados'] ?? []));

        $secciones = array_map(function (array $seccion) {
            $items = array_map(function (array $item) {
                $nombreBd = (string) ($item['nombre'] ?? '');
                $id = $this->resolvePackProductIdByNombre($nombreBd);
                $p = $id > 0
                    ? Producto::query()->where('idproducto', $id)->where('activo', true)->first()
                    : null;

                $contenido = $id > 0 ? $this->packEnrichment($id) : [
                    'siempre_incluye' => [],
                    'tu_eliges' => [],
                    'modalidad_tecnica' => null,
                    'componentes_preview' => [],
                ];

                return array_merge($item, [
                    'idproducto' => $id > 0 ? $id : null,
                    'precio_desde' => $p ? (int) round((float) $p->precio) : null,
                    'imagen_url' => $item['imagen'] ?? $p?->imagen_url,
                    'has_bundle_options' => isset(ProductBuilderFlags::idsNeedingBuilder([$id])[$id]),
                    'siempre_incluye' => $contenido['siempre_incluye'],
                    'tu_eliges' => $contenido['tu_eliges'],
                    'modalidad_tecnica' => $contenido['modalidad_tecnica'],
                    'componentes_preview' => $contenido['componentes_preview'],
                ]);
            }, (array) ($seccion['items'] ?? []));

            return array_merge($seccion, ['items' => $items]);
        }, (array) ($cfg['secciones'] ?? []));

        return [
            'title' => $cfg['title'] ?? 'Canastas, combos y reservas',
            'tagline' => $cfg['tagline'] ?? '',
            'subtitle' => $cfg['subtitle'] ?? '',
            'flujo' => (array) ($cfg['flujo'] ?? []),
            'confianza' => (array) ($cfg['confianza'] ?? []),
            'helados_listos' => $heladosListos,
            'regalos_cerrados' => $regalosCerrados,
            'secciones' => $secciones,
        ];
    }

    /**
     * @return array{combo_cerrado: bool, quick_add: bool}
     */
    private function enrichQuickAddFields(?Producto $p): array
    {
        if ($p === null) {
            return ['combo_cerrado' => false, 'quick_add' => false];
        }

        if (! $p->relationLoaded('bundleOptions')) {
            $p->load(['bundleOptions', 'customizationFields']);
        }

        $isCombo = ProductBuilderProfileService::isComboProduct($p);
        $hasCustom = $p->customizationFields->isNotEmpty();
        $quickAdd = ! $hasCustom && ($isCombo || ($p->es_pack && $p->bundleOptions->isEmpty()));

        return [
            'combo_cerrado' => $isCombo || ($p->es_pack && $p->bundleOptions->isEmpty()),
            'quick_add' => $quickAdd,
        ];
    }

    /**
     * Elige el producto pack correcto cuando hay duplicados (evita legacy #1909–#1932).
     */
    private function resolvePackProductIdByNombre(string $nombre): int
    {
        if ($nombre === '') {
            return 0;
        }

        $rows = DB::table('productos')
            ->where('nombre', $nombre)
            ->where('activo', true)
            ->orderByDesc('idproducto')
            ->get(['idproducto']);

        if ($rows->isEmpty()) {
            return 0;
        }

        $bestId = 0;
        $bestScore = -1;

        foreach ($rows as $row) {
            $id = (int) $row->idproducto;
            if ($id >= 1909 && $id <= 1932) {
                continue;
            }
            $comp = DB::table('producto_composicion')->where('id_pack', $id)->count();
            $opts = DB::table('product_bundle_options')->where('parent_product_id', $id)->count();
            $score = ($comp * 10) + $opts;
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestId = $id;
            }
        }

        if ($bestId > 0) {
            return $bestId;
        }

        return (int) $rows->first()->idproducto;
    }

    /**
     * @return array{
     *   siempre_incluye: list<string>,
     *   tu_eliges: list<array{grupo: string, tipo: string, opciones: list<string>}>,
     *   modalidad_tecnica: string|null
     * }
     */
    private function packContenidoResumen(int $idPack): array
    {
        $comp = DB::table('producto_composicion as pc')
            ->join('productos as c', 'c.idproducto', '=', 'pc.id_componente')
            ->where('pc.id_pack', $idPack)
            ->orderBy('c.nombre')
            ->get(['c.nombre', 'pc.cantidad']);

        $opts = DB::table('product_bundle_options as o')
            ->join('productos as c', 'c.idproducto', '=', 'o.child_product_id')
            ->where('o.parent_product_id', $idPack)
            ->orderBy('o.sort_order')
            ->get(['o.group_name', 'o.input_type', 'o.is_required', 'c.nombre']);

        $siempre = [];
        foreach ($comp as $c) {
            $qty = (int) $c->cantidad;
            $siempre[] = $qty > 1 ? "{$c->nombre} ×{$qty}" : (string) $c->nombre;
        }

        $tuEliges = [];
        foreach ($opts->groupBy('group_name') as $groupName => $groupOpts) {
            $first = $groupOpts->first();
            $tipo = (string) ($first->input_type ?? 'radio');
            $nombres = $groupOpts->pluck('nombre')->unique()->values()->all();
            $tuEliges[] = [
                'grupo' => (string) $groupName,
                'tipo' => $tipo === 'checkbox' ? 'checkbox' : 'radio',
                'opciones' => array_slice($nombres, 0, 8),
            ];
        }

        $gCount = count($tuEliges);
        $hasComp = $comp->isNotEmpty();
        $modalidad = null;
        if ($hasComp && $gCount === 0) {
            $modalidad = 'pack_cerrado_composicion';
        } elseif (! $hasComp && $gCount > 0) {
            $allSingle = collect($tuEliges)->every(fn ($g) => count($g['opciones']) === 1);
            $modalidad = $allSingle ? 'pack_cerrado_menu' : 'pack_abierto';
        } elseif ($hasComp && $gCount > 0) {
            $modalidad = 'pack_cerrado_composicion_mas_abierto';
        }

        return [
            'siempre_incluye' => $siempre,
            'tu_eliges' => $tuEliges,
            'modalidad_tecnica' => $modalidad,
        ];
    }

    /**
     * Miniaturas de componentes del pack (foto real o null → placeholder en web).
     *
     * @return list<array{idproducto: int, nombre: string, cantidad: int, imagen_url: string|null}>
     */
    private function packComponentesPreview(int $idPack, int $limit = 6): array
    {
        $rows = DB::table('producto_composicion as pc')
            ->join('productos as c', 'c.idproducto', '=', 'pc.id_componente')
            ->where('pc.id_pack', $idPack)
            ->where('c.activo', true)
            ->orderBy('c.nombre')
            ->get(['c.idproducto', 'c.nombre', 'pc.cantidad']);

        if ($rows->isEmpty()) {
            return [];
        }

        $ids = $rows->pluck('idproducto')->map(fn ($id) => (int) $id)->all();
        $productos = Producto::query()->whereIn('idproducto', $ids)->get()->keyBy('idproducto');

        $mapped = $rows->map(function ($r) use ($productos) {
            $p = $productos->get((int) $r->idproducto);

            return [
                'idproducto' => (int) $r->idproducto,
                'nombre' => (string) $r->nombre,
                'cantidad' => (int) $r->cantidad,
                'imagen_url' => $p?->imagen_url,
                '_has_img' => $p?->imagen_url ? 1 : 0,
            ];
        });

        return $mapped
            ->sortByDesc('_has_img')
            ->take($limit)
            ->map(fn ($row) => [
                'idproducto' => $row['idproducto'],
                'nombre' => $row['nombre'],
                'cantidad' => $row['cantidad'],
                'imagen_url' => $row['imagen_url'],
            ])
            ->values()
            ->all();
    }

    /**
     * @return array{
     *   siempre_incluye: list<string>,
     *   tu_eliges: list<array{grupo: string, tipo: string, opciones: list<string>}>,
     *   modalidad_tecnica: string|null,
     *   componentes_preview: list<array{idproducto: int, nombre: string, cantidad: int, imagen_url: string|null}>
     * }
     */
    private function packEnrichment(int $idPack): array
    {
        if ($idPack <= 0) {
            return [
                'siempre_incluye' => [],
                'tu_eliges' => [],
                'modalidad_tecnica' => null,
                'componentes_preview' => [],
            ];
        }

        return array_merge($this->packContenidoResumen($idPack), [
            'componentes_preview' => $this->packComponentesPreview($idPack),
        ]);
    }

    /**
     * @param  array<string, mixed>  $cfg
     * @return list<array{idcategoria: int, nombre: string}>
     */
    private function resolveCategoriasFromConfig(array $cfg): array
    {
        $categorias = [];
        foreach ((array) ($cfg['categorias_nombres'] ?? []) as $nombre) {
            $cat = DB::table('categoria')->where('nombre', $nombre)->first(['idcategoria', 'nombre']);
            if ($cat) {
                $categorias[] = [
                    'idcategoria' => (int) $cat->idcategoria,
                    'nombre' => $cat->nombre,
                ];
            }
        }

        return $categorias;
    }

    /**
     * @return array<string, mixed>
     */
    private function saladaDestacadosBlock(): array
    {
        $cfg = (array) config('salada_destacados', []);
        $nombres = array_column((array) ($cfg['destacados'] ?? []), 'nombre');
        $productos = collect();
        if ($nombres !== []) {
            $productos = Producto::query()
                ->whereIn('nombre', $nombres)
                ->where('activo', true)
                ->get()
                ->keyBy('nombre');
        }

        $destacados = array_map(function (array $item) use ($productos) {
            $p = $productos->get($item['nombre'] ?? '');

            return array_merge($item, [
                'idproducto' => $p ? (int) $p->idproducto : null,
                'precio_desde' => $p ? (int) round((float) $p->precio) : null,
                'imagen_url' => $item['imagen'] ?? $p?->imagen_url,
            ]);
        }, (array) ($cfg['destacados'] ?? []));

        $armaNombre = (string) (($cfg['arma_tu_base']['nombre'] ?? '') ?: 'Base salada Toppi\'s');
        $arma = Producto::query()
            ->where('nombre', $armaNombre)
            ->where('activo', true)
            ->first();

        $categorias = [];
        foreach ((array) ($cfg['categorias_nombres'] ?? []) as $nombre) {
            $cat = DB::table('categoria')->where('nombre', $nombre)->first(['idcategoria', 'nombre']);
            if ($cat) {
                $categorias[] = [
                    'idcategoria' => (int) $cat->idcategoria,
                    'nombre' => $cat->nombre,
                ];
            }
        }

        return [
            'title' => $cfg['title'] ?? 'Comida Toppi\'s',
            'tagline' => $cfg['tagline'] ?? '',
            'subtitle' => $cfg['subtitle'] ?? '',
            'destacados' => $destacados,
            'categorias' => $this->resolveCategoriasFromConfig($cfg),
            'arma_tu_base' => array_merge((array) ($cfg['arma_tu_base'] ?? []), [
                'idproducto' => $arma ? (int) $arma->idproducto : null,
                'precio_desde' => $arma ? (int) round((float) $arma->precio) : null,
            ]),
        ];
    }

    /**
     * @param  array<string, mixed>  $promo
     */
    private function heladosPromoActiva(array $promo): bool
    {
        $diasRaw = trim((string) ($promo['dias_semana'] ?? ''));
        if ($diasRaw !== '') {
            $allowed = array_filter(array_map('intval', preg_split('/\s*,\s*/', $diasRaw)));
            $today = (int) now()->format('N');
            if ($allowed !== [] && ! in_array($today, $allowed, true)) {
                return false;
            }
        }

        $hour = (int) now()->format('G');
        $start = array_key_exists('hora_inicio', $promo) ? (int) $promo['hora_inicio'] : 0;
        $end = array_key_exists('hora_fin', $promo) ? (int) $promo['hora_fin'] : 24;

        return $hour >= $start && $hour < $end;
    }

    /**
     * @return array<string, mixed>
     */
    private function block(string $key): array
    {
        $cfg = (array) config("home_experience.{$key}", []);

        $categoria = null;
        $categoriaNombre = (string) ($cfg['categoria_nombre'] ?? '');
        if ($categoriaNombre !== '') {
            $cat = DB::table('categoria')->where('nombre', $categoriaNombre)->first(['idcategoria', 'nombre']);
            if ($cat) {
                $categoria = [
                    'idcategoria' => (int) $cat->idcategoria,
                    'nombre' => $cat->nombre,
                ];
            }
        }

        $categoriasLinks = [];
        foreach ((array) ($cfg['categorias_ver_todas'] ?? []) as $nombre) {
            $cat = DB::table('categoria')->where('nombre', $nombre)->first(['idcategoria', 'nombre']);
            if ($cat) {
                $categoriasLinks[] = [
                    'idcategoria' => (int) $cat->idcategoria,
                    'nombre' => $cat->nombre,
                ];
            }
        }

        $nombres = array_filter((array) ($cfg['productos_destacados'] ?? []));
        $productos = collect();
        if ($nombres !== []) {
            $productos = Producto::query()
                ->with(['categorias', 'componentes'])
                ->whereIn('nombre', $nombres)
                ->where('activo', true)
                ->get()
                ->filter(fn ($p) => (int) $p->stock_disponible > 0)
                ->sortBy(fn ($p) => array_search($p->nombre, $nombres, true))
                ->values();
        }

        $ids = $productos->pluck('idproducto')->map(fn ($id) => (int) $id)->all();
        $needsBuilder = ProductBuilderFlags::idsNeedingBuilder($ids);
        $withCustomization = ProductBuilderFlags::idsWithCustomization($ids);

        $productosPayload = $productos->map(function ($p) use ($needsBuilder, $withCustomization, $key) {
            $id = (int) $p->idproducto;
            $sku = (string) ($p->codigobarra ?? '');
            $hasBundle = isset($needsBuilder[$id]) || (bool) $p->es_pack;
            if ($key === 'platos_listos' && str_starts_with($sku, 'TOPPI-LISTO-')) {
                $hasBundle = false;
            }

            $imagenUrl = $p->imagen_url;
            if ($key === 'regalos') {
                $imagenCfg = collect((array) config('regalos_destacados.destacados', []))
                    ->firstWhere('nombre', $p->nombre);
                if (is_array($imagenCfg) && ! empty($imagenCfg['imagen'])) {
                    $imagenUrl = $imagenCfg['imagen'];
                }
            }

            return [
                'idproducto' => $id,
                'nombre' => $p->nombre,
                'descripcion' => $p->descripcion,
                'precio_venta' => (int) round((float) $p->precio),
                'imagen_url' => $imagenUrl,
                'stock_actual' => (int) ($p->stock_actual ?? 0),
                'stock_disponible' => (int) $p->stock_disponible,
                'es_pack' => (bool) $p->es_pack,
                'has_bundle_options' => $hasBundle,
                'has_customization' => isset($withCustomization[$id]),
                'categorias' => $p->categorias,
            ];
        })->values();

        return [
            'title' => $cfg['title'] ?? '',
            'tagline' => $cfg['tagline'] ?? '',
            'description' => $cfg['description'] ?? '',
            'categoria' => $categoria,
            'categorias' => $categoriasLinks,
            'productos' => $productosPayload,
        ];
    }
}
