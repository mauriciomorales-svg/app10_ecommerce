<?php

namespace App\Services;

use App\Models\ProductBundleOption;
use App\Models\Producto;
use Illuminate\Validation\ValidationException;

class CheckoutPriceService
{
    /**
     * Normaliza ítems del carrito con precios y stock desde BD.
     *
     * @param  array<int, array<string, mixed>>  $rawItems
     * @return array<int, array<string, mixed>>
     */
    public static function resolveCartItems(array $rawItems): array
    {
        if ($rawItems === []) {
            throw ValidationException::withMessages(['items' => 'El carrito está vacío.']);
        }

        $resolved = [];

        foreach ($rawItems as $index => $raw) {
            $id = (int) ($raw['idproducto'] ?? 0);
            if ($id <= 0) {
                throw ValidationException::withMessages(["items.{$index}.idproducto" => 'Producto inválido.']);
            }

            $bundle = $raw['bundle_configuration'] ?? null;
            if (is_array($bundle) && ! empty($bundle['is_packaging'])) {
                continue;
            }

            /** @var Producto|null $producto */
            $producto = Producto::query()->find($id);
            if (! $producto || ! $producto->activo) {
                throw ValidationException::withMessages([
                    "items.{$index}.idproducto" => "El producto #{$id} no está disponible.",
                ]);
            }

            $qty = max(1, (int) ($raw['cantidad'] ?? 1));
            self::assertStockAvailable($producto, $qty, $bundle, $index);

            $unitPrice = self::lineUnitPrice($producto, is_array($bundle) ? $bundle : null);

            $resolved[] = [
                'idproducto' => $producto->idproducto,
                'nombre' => $producto->nombre,
                'cantidad' => $qty,
                'precio_venta' => $unitPrice,
                'bundle_configuration' => is_array($bundle) ? $bundle : null,
            ];
        }

        if ($resolved === []) {
            throw ValidationException::withMessages(['items' => 'No hay productos válidos en el carrito.']);
        }

        return $resolved;
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    public static function sumResolved(array $items): int
    {
        $sum = 0;
        foreach ($items as $item) {
            $sum += (int) $item['precio_venta'] * (int) $item['cantidad'];
        }

        return $sum;
    }

    private static function lineUnitPrice(Producto $producto, ?array $bundle): int
    {
        $price = (int) round((float) $producto->precio);

        if ($bundle === null) {
            return max(0, $price);
        }

        foreach ($bundle['modifiers'] ?? [] as $mod) {
            if (! is_array($mod)) {
                continue;
            }
            $childId = (int) ($mod['child_product_id'] ?? 0);
            if ($childId <= 0) {
                $price += (int) round((float) ($mod['price'] ?? 0));

                continue;
            }

            $option = ProductBundleOption::query()
                ->where('parent_product_id', $producto->idproducto)
                ->where('child_product_id', $childId)
                ->first();

            $price += (int) round((float) ($option?->price_modifier ?? $mod['price'] ?? 0));
        }

        foreach ($bundle['suggestions'] ?? [] as $suggestion) {
            if (! is_array($suggestion)) {
                continue;
            }
            $sid = (int) ($suggestion['idproducto'] ?? 0);
            if ($sid <= 0) {
                continue;
            }
            $sProduct = Producto::query()->find($sid);
            if ($sProduct && $sProduct->activo) {
                $price += (int) round((float) $sProduct->precio);
            }
        }

        return max(0, $price);
    }

  /**
     * @param  array<string, mixed>|null  $bundle
     */
    private static function assertStockAvailable(
        Producto $producto,
        int $qty,
        ?array $bundle,
        int $index
    ): void {
        if ($producto->es_pack && is_array($bundle) && ! empty($bundle['modifiers'])) {
            foreach ($bundle['modifiers'] as $mod) {
                if (! is_array($mod)) {
                    continue;
                }
                $childId = (int) ($mod['child_product_id'] ?? 0);
                if ($childId <= 0) {
                    continue;
                }
                $child = Producto::query()->find($childId);
                if (! $child) {
                    continue;
                }
                $option = ProductBundleOption::query()
                    ->where('parent_product_id', $producto->idproducto)
                    ->where('child_product_id', $childId)
                    ->first();
                $need = ($option?->quantity_deduction ?? 1) * $qty;
                if ((int) $child->stock_actual < $need) {
                    throw ValidationException::withMessages([
                        "items.{$index}" => "Stock insuficiente para «{$child->nombre}».",
                    ]);
                }
            }

            return;
        }

        if ($producto->es_pack && $producto->componentes()->exists()) {
            $producto->load('componentes');
            foreach ($producto->componentes as $componente) {
                $need = (int) $componente->pivot->cantidad * $qty;
                if ((int) $componente->stock_actual < $need) {
                    throw ValidationException::withMessages([
                        "items.{$index}" => "Stock insuficiente para el pack «{$producto->nombre}».",
                    ]);
                }
            }

            return;
        }

        if ((int) $producto->stock_actual < $qty) {
            throw ValidationException::withMessages([
                "items.{$index}" => "Stock insuficiente para «{$producto->nombre}».",
            ]);
        }
    }
}
