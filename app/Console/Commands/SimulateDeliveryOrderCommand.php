<?php

namespace App\Console\Commands;

use App\Models\Producto;
use App\Models\Venta;
use App\Services\JobsHoursStoreDemandService;
use App\Services\PickupFulfillmentService;
use App\Support\OrderTrackingUrl;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SimulateDeliveryOrderCommand extends Command
{
    protected $signature = 'commerce:simulate-delivery-order
        {--publish : Publicar mandado real en JobsHours}
        {--mock-status= : Simular estado JH: open|accepted|in_progress|completed}
        {--allow-production : Permitir ejecutar con APP_ENV=production}
        {--name=Cliente prueba MVP : Nombre comprador}
        {--email=prueba@dondemorales.cl : Email}
        {--phone=+56991234567 : Teléfono Chile}';

    protected $description = 'Crea una venta pagada con envío para probar timeline y /seguimiento (solo pruebas)';

    public function handle(): int
    {
        if (app()->environment('production') && ! $this->option('allow-production')) {
            $this->error('En producción usa --allow-production si es una prueba controlada.');

            return self::FAILURE;
        }

        $mockStatus = $this->option('mock-status');
        if ($mockStatus !== null && $mockStatus !== '') {
            $mockStatus = strtolower(trim((string) $mockStatus));
            $allowed = ['open', 'accepted', 'in_progress', 'completed'];
            if (! in_array($mockStatus, $allowed, true)) {
                $this->error('mock-status debe ser: '.implode('|', $allowed));

                return self::FAILURE;
            }
        }

        $storeLat = (float) config('delivery.store.lat');
        $storeLng = (float) config('delivery.store.lng');
        $destLat = $storeLat + 0.012;
        $destLng = $storeLng + 0.008;

        $venta = DB::transaction(function () use ($destLat, $destLng) {
            $product = Producto::query()->where('activo', true)->orderBy('idproducto')->first();

            $tempNum = (int) Venta::query()->max('numero_venta') + 1;

            $venta = Venta::create([
                'numero_venta' => $tempNum,
                'fecha' => now(),
                'estado' => 'pagado',
                'medio_pago' => 'simulacion',
                'total' => 15990,
                'subtotal' => 15000,
                'subtotal_productos' => 15000,
                'descuento' => 0,
                'packaging_key' => 'none',
                'packaging_label' => 'Sin empaque extra',
                'packaging_amount' => 0,
                'fulfillment_type' => 'delivery',
                'delivery_amount' => 2000,
                'delivery_address' => 'Av. Prueba 123, Renaico (simulación MVP)',
                'delivery_lat' => $destLat,
                'delivery_lng' => $destLng,
                'delivery_distance_km' => 1.5,
                'cliente_nombre' => (string) $this->option('name'),
                'cliente_email' => (string) $this->option('email'),
                'cliente_telefono' => (string) $this->option('phone'),
                'fecha_retiro' => now()->toDateString(),
                'estado_retiro' => 'envio_solicitado',
                'observaciones' => 'SIMULACIÓN MVP — '.now()->toIso8601String(),
                'fecha_finalizada' => now(),
                'jobshours_publish_status' => JobsHoursStoreDemandService::STATUS_PENDING,
            ]);

            $venta->update(['numero_venta' => $venta->idventa]);

            if ($product) {
                DB::table('detalle_venta')->insert([
                    'idventa' => $venta->idventa,
                    'idproducto' => $product->idproducto,
                    'cantidad' => 1,
                    'precio_unitario' => 15000,
                    'subtotal' => 15000,
                ]);
            }

            PickupFulfillmentService::assignPickupCode($venta);

            return $venta->fresh();
        });

        $this->info("Venta simulada #{$venta->idventa} (pagado + envío)");

        if ($this->option('publish')) {
            $ok = JobsHoursStoreDemandService::publishForPaidVenta($venta, force: true);
            $venta = $venta->fresh();
            if ($ok) {
                $this->info('JobsHours publicado. request_id='.$venta->jobshours_request_id);
            } else {
                $this->warn('JobsHours no publicó: '.($venta->jobshours_publish_error ?? 'error'));
            }
        } elseif ($mockStatus !== null && $mockStatus !== '') {
            $updates = [
                'jobshours_publish_status' => JobsHoursStoreDemandService::STATUS_PUBLISHED,
                'jobshours_publish_error' => null,
            ];

            if ($mockStatus === 'open') {
                $updates['jobshours_request_status'] = 'open';
                $updates['jobshours_payment_status'] = 'pending';
            } else {
                $updates['jobshours_request_status'] = $mockStatus;
                $updates['jobshours_payment_status'] = 'completed';
                $updates['jobshours_delivery_status'] = match ($mockStatus) {
                    'accepted' => 'Repartidor asignado',
                    'in_progress' => 'En camino',
                    'completed' => 'Entregado',
                    default => null,
                };
            }

            $venta->update($updates);
            $venta = $venta->fresh();
            $this->info("Estado JobsHours simulado: {$mockStatus}");
        }

        $public = PickupFulfillmentService::ventaToPublicArray($venta);
        $track = OrderTrackingUrl::signed((int) $venta->idventa);

        $this->newLine();
        $this->table(
            ['Campo', 'Valor'],
            [
                ['idventa', (string) $venta->idventa],
                ['codigo_retiro', (string) ($venta->codigo_retiro ?? '—')],
                ['jobshours_request_id', (string) ($venta->jobshours_request_id ?? '—')],
                ['jh_status', (string) ($venta->jobshours_request_status ?? '—')],
                ['tracking_url', $track],
                ['jh_customer_url', (string) ($public['jobshours_delivery_url'] ?? '—')],
                ['whatsapp_delivery_url', (string) ($public['whatsapp_delivery_url'] ?? '—')],
            ]
        );

        $this->comment('Abre tracking_url en el navegador para probar /seguimiento.');
        $this->comment('Eliminar después: DELETE manual en tabla venta o comando futuro commerce:purge-simulation.');

        return self::SUCCESS;
    }
}
