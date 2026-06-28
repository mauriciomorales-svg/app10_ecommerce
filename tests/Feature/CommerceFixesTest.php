<?php

namespace Tests\Feature;

use App\Models\Producto;
use App\Services\BundleConfigurationService;
use App\Support\VentaEstado;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class CommerceFixesTest extends TestCase
{
    public function test_venta_estado_paid_includes_pagado_and_legacy_activo(): void
    {
        $this->assertTrue(VentaEstado::isPaid('pagado'));
        $this->assertTrue(VentaEstado::isPaid('Pagado'));
        $this->assertTrue(VentaEstado::isPaid('activo'));
        $this->assertFalse(VentaEstado::isPaid('pendiente'));
        $this->assertFalse(VentaEstado::isPaid('rechazado'));
    }

    public function test_bundle_validation_rejects_missing_required_checkbox_group(): void
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('product_bundle_options')) {
            $this->markTestSkipped('product_bundle_options table missing');
        }

        $producto = Producto::withoutGlobalScopes(['commerce_store'])
            ->whereHas('bundleOptions', function ($q): void {
                $q->where('input_type', 'checkbox')->where('is_required', true);
            })
            ->first();

        if (! $producto) {
            $parentId = Producto::withoutGlobalScopes(['commerce_store'])->value('idproducto');
            if (! $parentId) {
                $this->markTestSkipped('No products in database');
            }

            \App\Models\ProductBundleOption::query()->create([
                'parent_product_id' => $parentId,
                'child_product_id' => Producto::withoutGlobalScopes(['commerce_store'])->where('idproducto', '!=', $parentId)->value('idproducto') ?? $parentId,
                'group_name' => 'Test extras obligatorios',
                'input_type' => 'checkbox',
                'is_required' => true,
                'sort_order' => 99,
            ]);

            $producto = Producto::withoutGlobalScopes(['commerce_store'])->find($parentId);
        }

        $this->expectException(ValidationException::class);

        BundleConfigurationService::validateForProduct($producto, [
            'modifiers' => [],
        ]);
    }
}
