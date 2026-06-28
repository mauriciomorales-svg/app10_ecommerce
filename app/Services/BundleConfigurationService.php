<?php

namespace App\Services;

use App\Models\CustomizationField;
use App\Models\ProductBundleOption;
use App\Models\Producto;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class BundleConfigurationService
{
    /**
     * @param  array<string, mixed>|null  $bundle
     */
    public static function validateForProduct(Producto $producto, ?array $bundle): void
    {
        if (! Schema::hasTable('product_bundle_options')) {
            return;
        }

        $hasOptions = ProductBundleOption::query()
            ->where('parent_product_id', $producto->idproducto)
            ->exists();

        if (! $hasOptions) {
            self::validateCustomizationFields($producto, $bundle);

            return;
        }

        if ($bundle === null || empty($bundle['modifiers'])) {
            throw ValidationException::withMessages([
                'bundle_configuration' => 'Este producto requiere elegir opciones antes de comprar.',
            ]);
        }

        $groups = ProductBundleOption::query()
            ->where('parent_product_id', $producto->idproducto)
            ->get()
            ->groupBy('group_name');

        $selectedChildIds = collect($bundle['modifiers'] ?? [])
            ->filter(fn ($m) => is_array($m))
            ->map(fn ($m) => (int) ($m['child_product_id'] ?? 0))
            ->filter(fn ($id) => $id > 0)
            ->values();

        foreach ($groups as $groupName => $options) {
            $first = $options->first();
            if (! $first || ! $first->is_required) {
                continue;
            }

            $groupChildIds = $options->pluck('child_product_id')->map(fn ($id) => (int) $id);
            $picked = $selectedChildIds->intersect($groupChildIds);

            if ($first->input_type === 'radio' && $picked->isEmpty()) {
                throw ValidationException::withMessages([
                    'bundle_configuration' => "Debes elegir una opción en «{$groupName}».",
                ]);
            }

            if ($first->input_type === 'checkbox' && $picked->isEmpty()) {
                throw ValidationException::withMessages([
                    'bundle_configuration' => "Debes elegir al menos una opción en «{$groupName}».",
                ]);
            }
        }

        self::validateCustomizationFields($producto, $bundle);
    }

    /**
     * @param  array<string, mixed>|null  $bundle
     */
    public static function customizationExtraCost(Producto $producto, ?array $bundle): int
    {
        if ($bundle === null || ! Schema::hasTable('customization_fields')) {
            return 0;
        }

        $custom = $bundle['customization'] ?? [];
        if (! is_array($custom) || $custom === []) {
            return 0;
        }

        $fields = CustomizationField::query()
            ->where('product_id', $producto->idproducto)
            ->get()
            ->keyBy('field_key');

        $extra = 0;
        foreach ($custom as $key => $value) {
            if (! is_string($key) || trim((string) $value) === '') {
                continue;
            }
            $field = $fields->get($key);
            if ($field) {
                $extra += (int) round((float) $field->extra_cost);
            }
        }

        return max(0, $extra);
    }

    /**
     * @param  array<string, mixed>|null  $bundle
     */
    private static function validateCustomizationFields(Producto $producto, ?array $bundle): void
    {
        if (! Schema::hasTable('customization_fields')) {
            return;
        }

        $required = CustomizationField::query()
            ->where('product_id', $producto->idproducto)
            ->where('is_required', true)
            ->get();

        if ($required->isEmpty()) {
            return;
        }

        $custom = is_array($bundle) ? ($bundle['customization'] ?? []) : [];
        if (! is_array($custom)) {
            $custom = [];
        }

        foreach ($required as $field) {
            $value = trim((string) ($custom[$field->field_key] ?? ''));
            if ($value === '') {
                throw ValidationException::withMessages([
                    'bundle_configuration' => "Completa el campo «{$field->label}».",
                ]);
            }
        }
    }
}
