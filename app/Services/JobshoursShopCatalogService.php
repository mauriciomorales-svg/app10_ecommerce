<?php

namespace App\Services;

use App\Models\CommerceStore;
use App\Models\Producto;
use App\Support\CurrentCommerceStore;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class JobshoursShopCatalogService
{
    /** @var array<string, int> */
    private array $categoryIds = [];

    /** @var array<string, int> */
    private array $productIds = [];

    private int $storeId;

    public function install(bool $forceBundles = false): array
    {
        $config = config('jobshours_shop_catalog');
        $store = $this->ensureStore($config['store'] ?? []);
        $this->storeId = (int) $store->id;

        CurrentCommerceStore::set($store);

        $this->ensureCategories($config['categories'] ?? []);
        $this->seedProducts(array_merge(
            $config['products'] ?? [],
            $config['internal_products'] ?? []
        ));
        $this->seedConfigurators($config['configurators'] ?? [], $forceBundles);
        $this->ensureDigitalPackagingProduct($config['packaging_digital']['digital'] ?? []);

        CurrentCommerceStore::forget();

        return [
            'store_id' => $this->storeId,
            'store_slug' => $store->slug,
            'products' => count($this->productIds),
            'categories' => count($this->categoryIds),
        ];
    }

    /**
     * @param  array<string, mixed>  $storeConfig
     */
    private function ensureStore(array $storeConfig): CommerceStore
    {
        $slug = (string) ($storeConfig['slug'] ?? 'jobshours');
        $settings = $storeConfig['settings'] ?? null;

        $store = CommerceStore::query()->where('slug', $slug)->first();

        if ($store === null) {
            $store = CommerceStore::query()->create([
                'slug' => $slug,
                'name' => (string) ($storeConfig['name'] ?? 'JobsHours'),
                'primary_host' => $storeConfig['primary_host'] ?? null,
                'host_aliases' => $storeConfig['host_aliases'] ?? null,
                'settings' => $settings,
                'active' => true,
                'is_template' => true,
            ]);
        } else {
            $store->update([
                'name' => (string) ($storeConfig['name'] ?? $store->name),
                'primary_host' => $storeConfig['primary_host'] ?? $store->primary_host,
                'host_aliases' => $storeConfig['host_aliases'] ?? $store->host_aliases,
                'settings' => $settings ?? $store->settings,
                'active' => true,
                'is_template' => true,
            ]);
        }

        return $store->fresh();
    }

    /**
     * @param  list<array<string, mixed>>  $categories
     */
    private function ensureCategories(array $categories): void
    {
        if (! Schema::hasTable('categoria')) {
            return;
        }

        foreach ($categories as $cat) {
            $slug = (string) ($cat['slug'] ?? '');
            $nombre = (string) ($cat['nombre'] ?? $slug);

            $existing = DB::table('categoria')
                ->where('nombre', $nombre)
                ->first();

            if ($existing) {
                $this->categoryIds[$slug] = (int) $existing->idcategoria;

                continue;
            }

            $data = ['nombre' => $nombre];
            if (Schema::hasColumn('categoria', 'activo')) {
                $data['activo'] = true;
            }
            if (Schema::hasColumn('categoria', 'created_at')) {
                $data['created_at'] = now();
                $data['updated_at'] = now();
            }

            $id = (int) DB::table('categoria')->insertGetId($data, 'idcategoria');
            $this->categoryIds[$slug] = $id;
        }
    }

    /**
     * @param  list<array<string, mixed>>  $products
     */
    private function seedProducts(array $products): void
    {
        foreach ($products as $row) {
            $this->upsertProduct($row);
        }
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function upsertProduct(array $row): int
    {
        $sku = (string) ($row['sku'] ?? '');
        if ($sku === '') {
            throw new \InvalidArgumentException('Producto sin SKU en catálogo JobsHours.');
        }

        $q = DB::table('productos')->where('codigobarra', $sku);
        if (Schema::hasColumn('productos', 'commerce_store_id')) {
            $q->where('commerce_store_id', $this->storeId);
        }

        $existing = $q->first();
        $categoriaSlug = (string) ($row['categoria'] ?? 'jh-planes');
        $categoriaId = $this->categoryIds[$categoriaSlug] ?? null;

        $data = [
            'nombre' => (string) ($row['nombre'] ?? $sku),
            'descripcion' => (string) ($row['descripcion'] ?? ''),
            'codigobarra' => $sku,
            'precio' => (int) ($row['precio'] ?? 0),
            'precio_costo' => 0,
            'stock_actual' => (bool) ($row['cotizar_only'] ?? false)
                ? 0
                : (int) ($row['stock'] ?? 500),
            'stock_minimo' => 0,
            'activo' => true,
            'es_pack' => (bool) ($row['es_pack'] ?? false),
            'idcategoria' => $categoriaId,
        ];

        if (Schema::hasColumn('productos', 'builder_profile')) {
            $data['builder_profile'] = (string) ($row['builder_profile'] ?? 'jh_plan');
        }

        if (Schema::hasColumn('productos', 'commerce_store_id')) {
            $data['commerce_store_id'] = $this->storeId;
        }

        if ($existing) {
            $data['updated_at'] = now();
            DB::table('productos')
                ->where('idproducto', $existing->idproducto)
                ->update($data);
            $id = (int) $existing->idproducto;
        } else {
            $data['created_at'] = now();
            $data['updated_at'] = now();
            $id = (int) DB::table('productos')->insertGetId($data, 'idproducto');
        }

        $this->productIds[$sku] = $id;

        if ($categoriaId && Schema::hasTable('producto_categoria')) {
            DB::table('producto_categoria')->updateOrInsert(
                ['idproducto' => $id, 'idcategoria' => $categoriaId],
                []
            );
        }

        return $id;
    }

    /**
     * @param  list<array<string, mixed>>  $configurators
     */
    private function seedConfigurators(array $configurators, bool $forceBundles): void
    {
        if (! Schema::hasTable('product_bundle_options')) {
            return;
        }

        foreach ($configurators as $cfg) {
            $parentSku = (string) ($cfg['parent_sku'] ?? '');
            $parentId = $this->productIds[$parentSku] ?? null;
            if ($parentId === null) {
                continue;
            }

            if ($forceBundles) {
                DB::table('product_bundle_options')
                    ->where('parent_product_id', $parentId)
                    ->delete();
            } elseif (DB::table('product_bundle_options')->where('parent_product_id', $parentId)->exists()) {
                $this->seedCustomizationFields($parentId, $cfg['customization_fields'] ?? []);

                continue;
            }

            $sortGroup = 0;
            foreach ($cfg['bundles'] ?? [] as $bundle) {
                $sortGroup += 10;
                $groupName = (string) ($bundle['group'] ?? 'Opciones');
                $inputType = (string) ($bundle['input_type'] ?? 'radio');
                $required = (bool) ($bundle['required'] ?? true);
                $sort = (int) ($bundle['sort'] ?? $sortGroup);

                $optSort = 0;
                foreach ($bundle['options'] ?? [] as $opt) {
                    $optSort += 10;
                    $childSku = (string) ($opt['sku'] ?? '');
                    $childId = $this->productIds[$childSku] ?? null;
                    if ($childId === null) {
                        continue;
                    }

                    DB::table('product_bundle_options')->insert(array_filter([
                        'parent_product_id' => $parentId,
                        'child_product_id' => $childId,
                        'group_name' => $groupName,
                        'input_type' => $inputType,
                        'is_required' => $required,
                        'price_modifier' => (int) ($opt['price_modifier'] ?? 0),
                        'quantity_deduction' => 0,
                        'sort_order' => $sort + (int) floor($optSort / 10),
                        'created_at' => Schema::hasColumn('product_bundle_options', 'created_at') ? now() : null,
                        'updated_at' => Schema::hasColumn('product_bundle_options', 'updated_at') ? now() : null,
                    ], fn ($v) => $v !== null));
                }
            }

            $this->seedCustomizationFields($parentId, $cfg['customization_fields'] ?? []);
        }
    }

    /**
     * @param  list<array<string, mixed>>  $fields
     */
    private function seedCustomizationFields(int $productId, array $fields): void
    {
        if (! Schema::hasTable('customization_fields') || $fields === []) {
            return;
        }

        foreach ($fields as $i => $field) {
            $key = (string) ($field['key'] ?? '');
            if ($key === '') {
                continue;
            }

            $exists = DB::table('customization_fields')
                ->where('product_id', $productId)
                ->where('field_key', $key)
                ->exists();

            $payload = [
                'product_id' => $productId,
                'label' => (string) ($field['label'] ?? $key),
                'field_key' => $key,
                'field_type' => (string) ($field['type'] ?? 'text'),
                'is_required' => (bool) ($field['required'] ?? false),
                'extra_cost' => 0,
                'options' => null,
                'sort_order' => ($i + 1) * 10,
                'updated_at' => now(),
            ];

            if ($exists) {
                DB::table('customization_fields')
                    ->where('product_id', $productId)
                    ->where('field_key', $key)
                    ->update($payload);
            } else {
                $payload['created_at'] = now();
                DB::table('customization_fields')->insert($payload);
            }
        }
    }

    /**
     * @param  array<string, mixed>  $opt
     */
    private function ensureDigitalPackagingProduct(array $opt): void
    {
        $barcode = (string) ($opt['barcode'] ?? 'JH-PACK-DIGITAL');
        if ($barcode === '' || ! Schema::hasTable('productos')) {
            return;
        }

        $q = DB::table('productos')->where('codigobarra', $barcode);
        if (Schema::hasColumn('productos', 'commerce_store_id')) {
            $q->where('commerce_store_id', $this->storeId);
        }

        if ($q->exists()) {
            return;
        }

        $catId = $this->categoryIds['jh-interno'] ?? null;

        DB::table('productos')->insert(array_filter([
            'nombre' => $opt['label'] ?? 'Servicio digital',
            'descripcion' => $opt['description'] ?? '',
            'codigobarra' => $barcode,
            'precio' => (int) ($opt['amount'] ?? 0),
            'precio_costo' => 0,
            'stock_actual' => 999,
            'stock_minimo' => 0,
            'activo' => true,
            'es_pack' => false,
            'idcategoria' => $catId,
            'commerce_store_id' => Schema::hasColumn('productos', 'commerce_store_id') ? $this->storeId : null,
            'builder_profile' => Schema::hasColumn('productos', 'builder_profile') ? 'jh_guia' : null,
            'created_at' => Schema::hasColumn('productos', 'created_at') ? now() : null,
            'updated_at' => Schema::hasColumn('productos', 'updated_at') ? now() : null,
        ], fn ($v) => $v !== null));
    }
}
