<?php

namespace App\Services;

use App\Models\Producto;
use Illuminate\Support\Collection;

class ProductBuilderProfileService
{
    /** @var list<string> */
    public const HELADO_CUSTOM_PROFILES = [
        'helado_soft',
        'helado_artesanal',
        'helado_yogen',
        'helado_arma',
    ];

    /**
     * @return array<string, string>
     */
    public static function selectOptions(): array
    {
        $options = [];
        foreach (config('product_builder_profiles.profiles', []) as $key => $meta) {
            $options[$key] = (string) ($meta['label'] ?? $key);
        }

        return $options;
    }

    public static function resolve(Producto $producto, bool $isComboProduct = false): string
    {
        $setting = self::profileSetting($producto);
        if ($setting !== 'auto' && $setting !== '') {
            return $setting;
        }

        return self::detect($producto, $isComboProduct);
    }

    public static function profileSetting(Producto $producto): string
    {
        $value = $producto->builder_profile ?? 'auto';

        return is_string($value) && $value !== '' ? $value : 'auto';
    }

    public static function detect(Producto $producto, bool $isComboProduct = false): string
    {
        $names = config('product_builder_profiles.auto_detect', []);
        $n = mb_strtolower($producto->nombre ?? '');

        if ($n === mb_strtolower((string) ($names['helado_soft_name'] ?? ''))) {
            return 'helado_soft';
        }
        if ($n === mb_strtolower((string) ($names['helado_artesanal_name'] ?? ''))) {
            return 'helado_artesanal';
        }
        if ($n === mb_strtolower((string) ($names['helado_arma_name'] ?? ''))) {
            return 'helado_arma';
        }
        if (
            str_contains($n, 'yogen')
            || str_contains($n, 'helado de yogurt')
            || str_contains($n, 'yogurt con fruta')
        ) {
            return 'helado_yogen';
        }
        if ($isComboProduct) {
            return 'helado_combo';
        }
        if ($producto->es_pack) {
            return 'regalo';
        }
        if (str_contains($n, 'base salada')) {
            return 'salada_base';
        }
        if (str_contains($n, 'chorrillana')) {
            return 'salada_chorrillana';
        }
        if (str_contains($n, 'wok')) {
            return 'salada_wok';
        }
        if (str_contains($n, 'completo') || str_contains($n, 'churrasco')) {
            return 'salada_sandwich';
        }

        $sku = strtoupper((string) ($producto->codigobarra ?? ''));
        if (str_starts_with($sku, 'JH-CFG')) {
            return 'jh_autoservicio';
        }
        if (str_starts_with($sku, 'JH-HW-')) {
            return 'jh_guia';
        }
        if (str_starts_with($sku, 'JH-')) {
            return 'jh_plan';
        }

        return 'generic';
    }

    public static function isComboProduct(Producto $producto): bool
    {
        $profile = self::profileSetting($producto);
        if ($profile === 'helado_arma') {
            return false;
        }

        $detected = self::detect($producto, false);
        if ($detected === 'helado_arma') {
            return false;
        }

        $groups = $producto->bundleOptions->groupBy('group_name');
        if ($groups->isEmpty()) {
            return false;
        }

        foreach ($groups as $options) {
            if ($options->count() !== 1) {
                return false;
            }
            if (($options->first()->input_type ?? '') !== 'radio') {
                return false;
            }
        }

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public static function meta(string $profile, ?string $productName = null): array
    {
        $profiles = config('product_builder_profiles.profiles', []);
        $base = $profiles[$profile] ?? $profiles['generic'] ?? [];

        $displayTitle = $base['display_title'] ?? null;
        if ($displayTitle === null && $profile === 'helado_combo' && $productName) {
            $displayTitle = $productName;
        }

        return [
            'profile' => $profile,
            'display_title' => $displayTitle,
            'line_label' => $base['line_label'] ?? null,
            'is_regalo' => (bool) ($base['is_regalo'] ?? false),
            'is_helado_builder' => (bool) ($base['is_helado_builder'] ?? false)
                || in_array($profile, self::HELADO_CUSTOM_PROFILES, true)
                || $profile === 'helado_combo',
            'is_helado_experience' => (bool) ($base['is_helado_experience'] ?? false)
                || self::inferHeladoExperience($profile, $productName),
            'helado_arma_tipo_step' => (bool) ($base['helado_arma_tipo_step'] ?? false),
            'group_sort_mode' => (string) ($base['group_sort_mode'] ?? 'db'),
            'hide_combo_suggestions' => (bool) ($base['hide_combo_suggestions'] ?? false),
            'is_jobs_hours_builder' => (bool) ($base['is_jobs_hours_builder'] ?? false)
                || $profile === 'jh_autoservicio',
            'modal_subtitle' => $base['modal_subtitle'] ?? null,
            'customize_title' => $base['customize_title'] ?? null,
            'add_to_cart_label' => $base['add_to_cart_label'] ?? null,
            'default_radio' => $base['default_radio'] ?? [],
            'helado_type_meta' => ($base['helado_arma_tipo_step'] ?? false) || $profile === 'helado_arma'
                ? config('product_builder_profiles.helado_type_meta', [])
                : [],
        ];
    }

    private static function inferHeladoExperience(string $profile, ?string $productName): bool
    {
        if (str_starts_with($profile, 'helado_')) {
            return true;
        }

        $n = mb_strtolower($productName ?? '');

        return (bool) preg_match('/(yogen|combo|mix|bomba|crunch|berry|galleta|antojo|supreme|fit fresh)/', $n);
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function formatBundleGroups(Producto $producto, string $profile, bool $isComboProduct): array
    {
        if ($producto->bundleOptions->isEmpty()) {
            return [];
        }

        $meta = self::meta($profile, $producto->nombre);
        $sortMode = (string) ($meta['group_sort_mode'] ?? 'db');

        $groups = $producto->bundleOptions
            ->sortBy([
                ['sort_order', 'asc'],
                ['id', 'asc'],
            ])
            ->groupBy('group_name')
            ->map(function (Collection $options, string $groupName) use ($profile, $isComboProduct) {
                $first = $options->first();
                $sortOrders = $options->pluck('sort_order')->map(fn ($v) => (int) $v);
                $sortOrder = $sortOrders->min() ?? 50;
                $configured = $sortOrders->unique()->count() > 1 || $sortOrder !== 0;

                $inputType = (string) ($first->input_type ?? 'radio');
                $stepCopy = self::groupStepCopy($profile, $groupName, $inputType, $isComboProduct);

                return [
                    'group_name' => $groupName,
                    'input_type' => $inputType,
                    'is_required' => (bool) $first->is_required,
                    'sort_order' => $sortOrder,
                    'sort_configured' => $configured,
                    'step_title' => $stepCopy['title'],
                    'step_hint' => $stepCopy['hint'],
                    'options' => $options->map(function ($opt) {
                        $child = $opt->childProduct;

                        return [
                            'id' => $opt->id,
                            'child_product_id' => $opt->child_product_id,
                            'sku' => $child ? (string) ($child->codigobarra ?? '') : '',
                            'nombre' => $child ? $child->nombre : 'Producto eliminado',
                            'imagen_url' => $child ? $child->imagen_url : null,
                            'precio' => $opt->price_modifier !== null
                                ? (float) $opt->price_modifier
                                : ($child ? (float) $child->precio : 0),
                            'stock_disponible' => $child ? $child->stock_disponible : 0,
                        ];
                    })->values()->all(),
                ];
            })
            ->values()
            ->all();

        return self::sortGroups($groups, $sortMode);
    }

    /**
     * @param  list<array<string, mixed>>  $groups
     * @return list<array<string, mixed>>
     */
    public static function sortGroups(array $groups, string $sortMode): array
    {
        $allConfigured = collect($groups)->every(fn (array $g) => (bool) ($g['sort_configured'] ?? false));
        $hasDistinctOrder = collect($groups)->pluck('sort_order')->unique()->count() > 1;

        if ($allConfigured || $hasDistinctOrder) {
            usort($groups, fn (array $a, array $b) => ($a['sort_order'] <=> $b['sort_order'])
                ?: strcmp((string) $a['group_name'], (string) $b['group_name']));

            return $groups;
        }

        $fallbackKey = $sortMode === 'helado_arma' ? 'helado_arma' : 'default';
        $rules = config("product_builder_profiles.group_sort_fallback.{$fallbackKey}", []);

        usort($groups, function (array $a, array $b) use ($rules) {
            $ka = self::fallbackSortKey((string) $a['group_name'], $rules);
            $kb = self::fallbackSortKey((string) $b['group_name'], $rules);

            return $ka <=> $kb ?: strcmp((string) $a['group_name'], (string) $b['group_name']);
        });

        return $groups;
    }

    /**
     * @param  list<array<string, mixed>>  $rules
     */
    private static function fallbackSortKey(string $groupName, array $rules): int
    {
        $gn = mb_strtolower($groupName);
        foreach ($rules as $rule) {
            foreach ((array) ($rule['match'] ?? []) as $needle) {
                if (! str_contains($gn, mb_strtolower((string) $needle))) {
                    continue 2;
                }
            }
            foreach ((array) ($rule['exclude'] ?? []) as $exclude) {
                if (str_contains($gn, mb_strtolower((string) $exclude))) {
                    continue 2;
                }
            }

            return (int) ($rule['order'] ?? 50);
        }

        return 50;
    }

    /**
     * @return array{title: string, hint: string}
     */
    public static function groupStepCopy(
        string $profile,
        string $groupName,
        string $inputType,
        bool $isComboProduct
    ): array {
        $gn = mb_strtolower($groupName);
        $isRadio = $inputType === 'radio';

        foreach (config('product_builder_profiles.group_step_rules', []) as $rule) {
            $profiles = $rule['profiles'] ?? null;
            if (is_array($profiles) && ! in_array($profile, $profiles, true)) {
                continue;
            }

            $ruleInput = $rule['input_type'] ?? null;
            if ($ruleInput !== null && $ruleInput !== $inputType) {
                continue;
            }

            $matched = false;
            foreach ((array) ($rule['group_match'] ?? []) as $needle) {
                if (str_contains($gn, mb_strtolower((string) $needle))) {
                    $matched = true;
                    break;
                }
            }
            if (! $matched) {
                continue;
            }

            foreach ((array) ($rule['exclude_group'] ?? []) as $exclude) {
                if (str_contains($gn, mb_strtolower((string) $exclude))) {
                    continue 2;
                }
            }

            $title = $rule['title'] ?? null;
            if ($title === null && ! empty($rule['use_group_name'])) {
                $title = $groupName;
            }

            return [
                'title' => (string) ($title ?? $groupName),
                'hint' => (string) ($rule['hint'] ?? ''),
            ];
        }

        if ($isRadio) {
            $hint = match (true) {
                $profile === 'helado_combo', $profile === 'helado_yogen' => 'Incluido en tu pedido',
                $isComboProduct => 'Incluido en tu combo',
                default => 'Precio final con esta opción',
            };

            return ['title' => $groupName, 'hint' => $hint];
        }

        return ['title' => $groupName, 'hint' => 'Opcional — suma al total'];
    }

    /**
     * @return array<string, mixed>
     */
    public static function builderPayload(Producto $producto): array
    {
        $isCombo = self::isComboProduct($producto);
        $profile = self::resolve($producto, $isCombo);

        return [
            'builder_profile' => $profile,
            'builder_profile_setting' => self::profileSetting($producto),
            'builder_meta' => self::meta($profile, $producto->nombre),
            'is_combo_product' => $isCombo,
        ];
    }
}
