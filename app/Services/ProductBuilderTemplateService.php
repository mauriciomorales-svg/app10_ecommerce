<?php

namespace App\Services;

use App\Models\CustomizationField;
use App\Models\ProductBundleOption;
use App\Models\Producto;
use App\Models\ProductoSugerencia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProductBuilderTemplateService
{
    /**
     * @return array<string, array{label: string, description?: string, source_product_id?: int, source_name?: string, es_pack?: bool}>
     */
    public static function templates(): array
    {
        $templates = config('product_builder_templates.templates', []);
        $resolved = [];

        foreach ($templates as $key => $meta) {
            $sourceId = self::resolveSourceProductId($meta);
            $resolved[$key] = array_merge($meta, [
                'source_product_id' => $sourceId,
                'available' => $sourceId !== null,
            ]);
        }

        return $resolved;
    }

    /**
     * @param  array<string, mixed>  $meta
     */
    public static function resolveSourceProductId(array $meta): ?int
    {
        if (! empty($meta['source_product_id'])) {
            $id = (int) $meta['source_product_id'];

            return Producto::withoutGlobalScopes(['commerce_store'])->where('idproducto', $id)->exists()
                ? $id
                : null;
        }

        $name = trim((string) ($meta['source_name'] ?? ''));
        if ($name === '') {
            return null;
        }

        return Producto::withoutGlobalScopes(['commerce_store'])
            ->where('nombre', 'ilike', $name)
            ->value('idproducto');
    }

    public static function applyTemplate(Producto $target, string $templateKey, bool $replace = true): int
    {
        $templates = config('product_builder_templates.templates', []);
        if (! isset($templates[$templateKey])) {
            throw new \InvalidArgumentException("Plantilla desconocida: {$templateKey}");
        }

        $meta = $templates[$templateKey];
        $sourceId = self::resolveSourceProductId($meta);
        if ($sourceId === null) {
            throw new \RuntimeException('No se encontró el producto plantilla configurado.');
        }

        $updates = [];
        if (array_key_exists('es_pack', $meta)) {
            $updates['es_pack'] = (bool) $meta['es_pack'];
        }
        if (! empty($meta['builder_profile']) && Schema::hasColumn('productos', 'builder_profile')) {
            $updates['builder_profile'] = (string) $meta['builder_profile'];
        }
        if ($updates !== []) {
            $target->update($updates);
            $target->refresh();
        }

        return self::copyPersonalizationFrom($sourceId, $target, $replace);
    }

    public static function copyPersonalizationFrom(int $sourceProductId, Producto $target, bool $replace = true): int
    {
        $source = Producto::withoutGlobalScopes(['commerce_store'])
            ->with(['bundleOptions', 'customizationFields', 'sugerenciasOrigen', 'componentes'])
            ->findOrFail($sourceProductId);

        if ((int) $source->idproducto === (int) $target->idproducto) {
            throw new \InvalidArgumentException('El producto origen y destino son el mismo.');
        }

        $copied = 0;

        DB::transaction(function () use ($source, $target, $replace, &$copied): void {
            if ($replace) {
                $target->bundleOptions()->delete();
                $target->customizationFields()->delete();
                if (Schema::hasTable('producto_sugerencias')) {
                    $target->sugerenciasOrigen()->delete();
                }
                if ($target->es_pack) {
                    $target->componentes()->detach();
                }
            }

            foreach ($source->bundleOptions as $option) {
                ProductBundleOption::query()->create([
                    'parent_product_id' => $target->idproducto,
                    'child_product_id' => $option->child_product_id,
                    'group_name' => $option->group_name,
                    'input_type' => $option->input_type,
                    'is_required' => $option->is_required,
                    'price_modifier' => $option->price_modifier,
                    'quantity_deduction' => $option->quantity_deduction,
                    'sort_order' => $option->sort_order,
                ]);
                $copied++;
            }

            foreach ($source->customizationFields as $field) {
                CustomizationField::query()->create([
                    'product_id' => $target->idproducto,
                    'label' => $field->label,
                    'field_key' => $field->field_key,
                    'field_type' => $field->field_type,
                    'is_required' => $field->is_required,
                    'extra_cost' => $field->extra_cost,
                    'options' => $field->options,
                    'sort_order' => $field->sort_order,
                ]);
                $copied++;
            }

            if (Schema::hasTable('producto_sugerencias')) {
                foreach ($source->sugerenciasOrigen as $sug) {
                    ProductoSugerencia::query()->create([
                        'producto_origen_id' => $target->idproducto,
                        'producto_sugerido_id' => $sug->producto_sugerido_id,
                        'mensaje' => $sug->mensaje,
                        'tipo' => $sug->tipo,
                        'orden' => $sug->orden,
                        'activo' => $sug->activo,
                    ]);
                    $copied++;
                }
            }

            if ($source->es_pack && $source->componentes->isNotEmpty()) {
                $target->update(['es_pack' => true]);
                foreach ($source->componentes as $componente) {
                    $target->componentes()->syncWithoutDetaching([
                        $componente->idproducto => ['cantidad' => (int) $componente->pivot->cantidad],
                    ]);
                    $copied++;
                }
            }
        });

        return $copied;
    }
}
