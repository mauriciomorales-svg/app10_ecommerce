<?php

namespace App\Console\Commands;

use App\Models\CommerceStore;
use Illuminate\Console\Command;

class CommerceStoreCreateCommand extends Command
{
    protected $signature = 'commerce:store-create
                            {slug : Identificador único (ej. floreria-centro)}
                            {name : Nombre visible}
                            {--host= : Dominio principal (ej. tienda.ejemplo.cl)}
                            {--aliases= : Hosts extra separados por coma}
                            {--template : Marcar como plantilla tipo DondeMorales (premium)}';

    protected $description = 'Alta de una tienda en commerce_stores (multi‑instancia / plantilla premium).';

    public function handle(): int
    {
        $slug = strtolower(trim(preg_replace('/\s+/', '-', (string) $this->argument('slug'))));
        if ($slug === '' || strlen($slug) > 64) {
            $this->error('Slug inválido.');

            return self::FAILURE;
        }

        if (CommerceStore::query()->where('slug', $slug)->exists()) {
            $this->error("Ya existe una tienda con slug «{$slug}».");

            return self::FAILURE;
        }

        $host = $this->option('host') ? strtolower(trim((string) $this->option('host'))) : null;
        if ($host !== null && CommerceStore::query()->whereRaw('LOWER(primary_host) = ?', [$host])->exists()) {
            $this->error("El host «{$host}» ya está asignado a otra tienda.");

            return self::FAILURE;
        }

        $aliases = $this->option('aliases') ? trim((string) $this->option('aliases')) : null;

        CommerceStore::query()->create([
            'slug' => $slug,
            'name' => trim((string) $this->argument('name')),
            'primary_host' => $host,
            'host_aliases' => $aliases,
            'settings' => null,
            'active' => true,
            'is_template' => (bool) $this->option('template'),
        ]);

        $created = CommerceStore::query()->where('slug', $slug)->firstOrFail();

        $this->info("Tienda «{$slug}» creada (id {$created->id}).");
        $this->comment('Asigná productos: UPDATE productos SET commerce_store_id = '.$created->id.' WHERE …');

        return self::SUCCESS;
    }
}
