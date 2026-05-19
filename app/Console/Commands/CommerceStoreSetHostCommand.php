<?php

namespace App\Console\Commands;

use App\Models\CommerceStore;
use Illuminate\Console\Command;

class CommerceStoreSetHostCommand extends Command
{
    protected $signature = 'commerce:store-set-host
                            {slug : Slug de la tienda en commerce_stores}
                            {host : Dominio principal (ej. dondemorales.cl, sin https)}';

    protected $description = 'Asigna primary_host a una tienda (para que el middleware resuelva por Host).';

    public function handle(): int
    {
        $slug = trim((string) $this->argument('slug'));
        $host = strtolower(trim((string) $this->argument('host')));
        $host = preg_replace('#^https?://#', '', $host);
        $host = rtrim($host, '/');

        if ($host === '') {
            $this->error('Host inválido.');

            return self::FAILURE;
        }

        $store = CommerceStore::query()->where('slug', $slug)->first();
        if (! $store) {
            $this->error("No existe tienda con slug «{$slug}».");

            return self::FAILURE;
        }

        $other = CommerceStore::query()
            ->where('id', '!=', $store->id)
            ->whereRaw('LOWER(primary_host) = ?', [$host])
            ->first();
        if ($other) {
            $this->error("El host «{$host}» ya está en la tienda «{$other->slug}».");

            return self::FAILURE;
        }

        $store->update(['primary_host' => $host]);
        $this->info("Tienda «{$slug}»: primary_host = {$host}");

        return self::SUCCESS;
    }
}
