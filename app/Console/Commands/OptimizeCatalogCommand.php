<?php

namespace App\Console\Commands;

use App\Services\ProductCategorySync;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OptimizeCatalogCommand extends Command
{
    protected $signature = 'commerce:optimize-catalog {--dry-run : Solo mostrar cambios}';

    protected $description = 'Activa stock en packs personalizables, desactiva duplicados y potencia destacados';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $config = config('commerce_showcase', []);

        $deactivate = array_map('intval', (array) ($config['deactivate_product_ids'] ?? []));
        $stocks = (array) ($config['default_stock'] ?? []);
        $boost = (array) ($config['boost_veces_vendido'] ?? []);

        if ($dryRun) {
            $this->warn('Modo dry-run');
        }

        if ($deactivate !== [] && Schema::hasColumn('productos', 'activo')) {
            $this->info('Desactivando '.count($deactivate).' productos duplicados…');
            if (! $dryRun) {
                DB::table('productos')
                    ->whereIn('idproducto', $deactivate)
                    ->update([
                        'activo' => false,
                        'stock_actual' => 0,
                    ]);
            }
            foreach ($deactivate as $id) {
                $name = DB::table('productos')->where('idproducto', $id)->value('nombre');
                $this->line("  - [{$id}] {$name}");
            }
        } elseif ($deactivate !== []) {
            if (! $dryRun) {
                DB::table('productos')->whereIn('idproducto', $deactivate)->update(['stock_actual' => 0]);
            }
            $this->info('Duplicados sin columna activo: stock=0 en '.count($deactivate).' IDs');
        }

        $this->info('Ajustando stock showcase…');
        foreach ($stocks as $id => $qty) {
            $id = (int) $id;
            $qty = (int) $qty;
            $row = DB::table('productos')->where('idproducto', $id)->first(['nombre', 'stock_actual', 'activo']);
            if (! $row) {
                $this->warn("  [{$id}] no existe, omitido");

                continue;
            }
            $this->line("  [{$id}] {$row->nombre}: stock {$row->stock_actual} → {$qty}");
            if (! $dryRun) {
                $update = ['stock_actual' => $qty];
                if (Schema::hasColumn('productos', 'activo')) {
                    $update['activo'] = true;
                }
                DB::table('productos')->where('idproducto', $id)->update($update);
            }
        }

        if ($boost !== [] && Schema::hasColumn('productos', 'veces_vendido')) {
            $this->info('Potenciando veces_vendido para destacados…');
            foreach ($boost as $id => $times) {
                $id = (int) $id;
                $times = (int) $times;
                if (! $dryRun) {
                    DB::table('productos')->where('idproducto', $id)->update(['veces_vendido' => $times]);
                }
                $this->line("  [{$id}] veces_vendido → {$times}");
            }
        }

        if (! $dryRun) {
            $cat = ProductCategorySync::sync(true, false);
            $this->info("Categorías: pivot +{$cat['legacy_synced']}, auto {$cat['auto_assigned']}");
            Cache::flush();
        }

        $this->info('Listo. Recarga dondemorales.cl con Ctrl+F5.');

        return self::SUCCESS;
    }
}
