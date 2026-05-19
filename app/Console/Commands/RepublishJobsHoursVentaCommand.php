<?php

namespace App\Console\Commands;

use App\Models\Venta;
use App\Services\JobsHoursStoreDemandService;
use Illuminate\Console\Command;

class RepublishJobsHoursVentaCommand extends Command
{
    protected $signature = 'commerce:republish-jobshours {venta_id : idventa}';

    protected $description = 'Republica manualmente una venta en JobsHours (store-demand)';

    public function handle(): int
    {
        $venta = Venta::query()->find((int) $this->argument('venta_id'));
        if (! $venta) {
            $this->error('Venta no encontrada');

            return self::FAILURE;
        }

        $venta->update(['jobshours_request_id' => null]);
        $ok = JobsHoursStoreDemandService::publishForPaidVenta($venta, force: true);

        if ($ok) {
            $this->info('Publicado. request_id='.($venta->fresh()->jobshours_request_id ?? '—'));

            return self::SUCCESS;
        }

        $this->error('Falló: '.($venta->fresh()->jobshours_publish_error ?? 'unknown'));

        return self::FAILURE;
    }
}
