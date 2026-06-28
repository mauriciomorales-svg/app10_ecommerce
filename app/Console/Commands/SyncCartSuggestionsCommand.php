<?php

namespace App\Console\Commands;

use App\Services\CartSuggestionSeedSync;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class SyncCartSuggestionsCommand extends Command
{
    protected $signature = 'commerce:sync-cart-suggestions {--dry-run : Solo mostrar resumen}';

    protected $description = 'Sincroniza producto_sugerencias desde catálogo actual + pares curados en config';

    public function handle(): int
    {
        if (! Schema::hasTable('producto_sugerencias')) {
            $this->error('Tabla producto_sugerencias no existe.');

            return self::FAILURE;
        }

        $built = CartSuggestionSeedSync::buildPairs();
        $pairs = $built['pairs'];
        $stats = $built['stats'];

        $this->info("Pares manuales (config): {$stats['manual']}");
        $this->info("Pares generados (catálogo): {$stats['generated']}");
        $this->info("Total a sincronizar: {$stats['total']}");

        if ($this->option('dry-run')) {
            foreach (array_slice($pairs, 0, 15) as $p) {
                $this->line("  {$p['origen']} → {$p['sugerido']}: {$p['mensaje']}");
            }
            if (count($pairs) > 15) {
                $this->line('  ...');
            }

            return self::SUCCESS;
        }

        $result = CartSuggestionSeedSync::upsertPairs($pairs, true);
        Cache::flush();

        $this->info("Creadas: {$result['created']}, actualizadas: {$result['updated']}, omitidas: {$result['skipped']}");

        return self::SUCCESS;
    }
}
