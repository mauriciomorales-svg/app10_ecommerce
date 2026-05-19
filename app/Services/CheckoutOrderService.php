<?php

namespace App\Services;

use App\Models\Venta;
use Illuminate\Support\Facades\DB;

class CheckoutOrderService
{
    /**
     * @param  array<int, array<string, mixed>>  $items  Ítems ya resueltos por CheckoutPriceService
     * @param  array<string, mixed>  $cliente
     * @param  array<string, mixed>|null  $delivery
     */
    public static function createPendingOrder(
        array $items,
        array $cliente,
        string $packagingKey,
        string $medioPago = 'flow',
        string $fulfillmentType = 'pickup',
        ?array $delivery = null,
        ?array $totals = null
    ): Venta {
        $totals = $totals ?? CheckoutTotalsService::compute($items, $packagingKey, $fulfillmentType, $delivery);

        $subtotalProductos = (int) $totals['subtotal_productos'];
        $packaging = $totals['packaging'];
        $deliveryAmount = (int) ($totals['delivery_amount'] ?? 0);
        $deliveryQuote = $totals['delivery'] ?? null;
        $total = (int) $totals['total'];

        $nombre = trim((string) ($cliente['nombre'] ?? ''));
        $email = trim((string) ($cliente['email'] ?? ''));
        $telefono = trim((string) ($cliente['telefono'] ?? ''));
        $fechaRetiro = (string) ($cliente['fecha_retiro'] ?? '');

        $venta = Venta::create([
            'numero_venta' => null,
            'fecha' => now(),
            'total' => $total,
            'subtotal' => $subtotalProductos,
            'subtotal_productos' => $subtotalProductos,
            'descuento' => 0,
            'medio_pago' => $medioPago,
            'estado' => 'pendiente',
            'estado_retiro' => $fulfillmentType === 'pickup' ? 'pendiente_preparacion' : 'envio_solicitado',
            'fulfillment_type' => $fulfillmentType,
            'delivery_amount' => $deliveryAmount,
            'delivery_address' => $fulfillmentType === 'delivery' ? ($delivery['address'] ?? null) : null,
            'delivery_lat' => $fulfillmentType === 'delivery' ? ($delivery['lat'] ?? null) : null,
            'delivery_lng' => $fulfillmentType === 'delivery' ? ($delivery['lng'] ?? null) : null,
            'delivery_distance_km' => is_array($deliveryQuote) ? ($deliveryQuote['distance_km_adjusted'] ?? null) : null,
            'cliente_nombre' => $nombre,
            'cliente_email' => $email,
            'cliente_telefono' => $telefono,
            'fecha_retiro' => $fechaRetiro !== '' ? $fechaRetiro : null,
            'packaging_key' => $packaging['key'],
            'packaging_label' => $packaging['label'],
            'packaging_amount' => $packaging['amount'],
            'observaciones' => self::buildObservaciones($nombre, $email, $telefono, $fechaRetiro, $packaging, $fulfillmentType, $delivery, $deliveryAmount),
            'jobshours_publish_status' => $fulfillmentType === 'delivery'
                ? JobsHoursStoreDemandService::STATUS_PENDING
                : null,
        ]);

        $venta->update(['numero_venta' => $venta->idventa]);

        foreach ($items as $item) {
            self::insertDetalle($venta->idventa, $item);
        }

        if ($packaging['product_id'] && $packaging['amount'] >= 0) {
            self::insertDetalle($venta->idventa, [
                'idproducto' => $packaging['product_id'],
                'cantidad' => 1,
                'precio_venta' => $packaging['amount'],
                'nombre' => $packaging['label'],
                'bundle_configuration' => ['is_packaging' => true, 'packaging_key' => $packaging['key']],
            ]);
        }

        return $venta->fresh();
    }

    /**
     * @param  array<int, array<string, mixed>>  $rawItems
     */
    public static function sumItems(array $rawItems): int
    {
        return CheckoutPriceService::sumResolved(CheckoutPriceService::resolveCartItems($rawItems));
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private static function insertDetalle(int $idventa, array $item): void
    {
        $qty = (int) ($item['cantidad'] ?? 1);
        $unit = (float) ($item['precio_venta'] ?? 0);

        $insertData = [
            'idventa' => $idventa,
            'idproducto' => (int) $item['idproducto'],
            'cantidad' => $qty,
            'precio_unitario' => $unit,
            'subtotal' => $unit * $qty,
        ];

        if (! empty($item['bundle_configuration'])) {
            $insertData['bundle_configuration'] = json_encode($item['bundle_configuration']);
        }

        DB::table('detalle_venta')->insert($insertData);
    }

    /**
     * @param  array<string, mixed>  $packaging
     * @param  array<string, mixed>|null  $delivery
     */
    private static function buildObservaciones(
        string $nombre,
        string $email,
        string $telefono,
        string $fechaRetiro,
        array $packaging,
        string $fulfillmentType,
        ?array $delivery,
        int $deliveryAmount
    ): string {
        $parts = array_filter([
            'Web',
            $fulfillmentType === 'delivery' ? 'Modalidad: envío a domicilio' : 'Modalidad: retiro en tienda',
            $nombre !== '' ? "Cliente: {$nombre}" : null,
            $email !== '' ? "Email: {$email}" : null,
            $telefono !== '' ? "Tel: {$telefono}" : null,
            $fechaRetiro !== '' ? ($fulfillmentType === 'delivery' ? "Fecha preferida: {$fechaRetiro}" : "Retiro: {$fechaRetiro}") : null,
            $fulfillmentType === 'delivery' && is_array($delivery)
                ? 'Destino: '.($delivery['address'] ?? '')
                : null,
            $fulfillmentType === 'delivery' && $deliveryAmount > 0
                ? 'Envío estimado JobsHours (cliente paga aparte): $'.number_format($deliveryAmount, 0, ',', '.')
                : null,
            'Empaque: '.($packaging['label'] ?? ''),
        ]);

        return implode(' | ', $parts);
    }

    public static function markPaid(Venta $venta, string $medioPago): Venta
    {
        return DB::transaction(function () use ($venta, $medioPago) {
            $locked = Venta::query()
                ->where('idventa', $venta->idventa)
                ->lockForUpdate()
                ->first();

            if (! $locked) {
                return $venta;
            }

            if (strtolower((string) $locked->estado) === 'pagado') {
                $fresh = $locked->fresh();
                if ((string) ($fresh->fulfillment_type ?? '') === 'delivery' && ! $fresh->jobshours_request_id) {
                    JobsHoursStoreDemandService::publishForPaidVenta($fresh);
                }

                return $fresh->fresh();
            }

            $locked->update([
                'estado' => 'pagado',
                'medio_pago' => $medioPago,
                'fecha_finalizada' => now(),
            ]);

            PickupFulfillmentService::assignPickupCode($locked);
            InventoryService::deductStockForVenta((int) $locked->idventa);

            $fresh = $locked->fresh();
            JobsHoursStoreDemandService::publishForPaidVenta($fresh);

            return $fresh;
        });
    }
}
