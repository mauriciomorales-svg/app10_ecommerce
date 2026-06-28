<?php

namespace App\Console\Commands;

use App\Services\JobshoursShopCatalogService;
use Illuminate\Console\Command;

class JobshoursInstallShopCommand extends Command
{
    protected $signature = 'jobshours:install-shop
                            {--force-bundles : Recrea opciones de bundle del configurador}';

    protected $description = 'Crea tienda commerce_store jobshours + catálogo B2B (planes, implementación, servicios).';

    public function handle(JobshoursShopCatalogService $service): int
    {
        if (! \Illuminate\Support\Facades\Schema::hasTable('commerce_stores')) {
            $this->error('Ejecutá antes: php artisan migrate (commerce_stores).');

            return self::FAILURE;
        }

        $result = $service->install((bool) $this->option('force-bundles'));

        $this->info('Tienda JobsHours lista.');
        $this->table(
            ['Campo', 'Valor'],
            [
                ['store_id', (string) $result['store_id']],
                ['slug', $result['store_slug']],
                ['productos', (string) $result['products']],
                ['categorías', (string) $result['categories']],
            ]
        );

        $host = config('jobshours_shop_catalog.store.primary_host');
        $this->newLine();
        $this->comment("Host sugerido: {$host}");
        $this->comment('Local: agregá tienda.jobshours.local → 127.0.0.1 y serví el frontend con ese Host.');
        $this->comment('Producción: php artisan commerce:store-set-host jobshours '.$host);

        return self::SUCCESS;
    }
}
