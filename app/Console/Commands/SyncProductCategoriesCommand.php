<?php

namespace App\Console\Commands;

use App\Services\ProductCategorySync;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SyncProductCategoriesCommand extends Command
{
    protected $signature = 'commerce:sync-product-categories
                            {--all : Incluir productos sin stock}
                            {--active-only : Solo productos activos}
                            {--dry-run : Solo mostrar resumen}';

    protected $description = 'Categoriza productos por nombre y sincroniza producto_categoria';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $onlyWithStock = ! $this->option('all');
        $onlyActive = (bool) $this->option('active-only');

        if ($dryRun) {
            $this->warn('Modo dry-run: no se escribirá en la base de datos.');
        }

        $scope = $onlyWithStock ? 'con stock' : 'catálogo completo';
        if ($onlyActive) {
            $scope .= ' (solo activos)';
        }
        $this->info("Categorizando: {$scope}");

        $result = ProductCategorySync::sync($onlyWithStock, $dryRun, $onlyActive);

        $this->table(
            ['Métrica', 'Cantidad'],
            [
                ['Pivot desde idcategoria', $result['legacy_synced']],
                ['Categoría asignada/corregida', $result['auto_assigned']],
                ['Ya correctos', $result['unchanged']],
                ['Omitidos (nombre sistema)', $result['skipped']],
                ['Sin regla de nombre', $result['no_match']],
                ['Total relaciones pivot', $result['pivot_total']],
            ]
        );

        if (! $dryRun) {
            Cache::flush();
            $this->line('');
            $this->info('Por categoría:');
            foreach (DB::table('categoria as c')
                ->leftJoin('producto_categoria as pc', 'c.idcategoria', '=', 'pc.idcategoria')
                ->select('c.nombre', DB::raw('count(pc.idproducto) as total'))
                ->groupBy('c.idcategoria', 'c.nombre')
                ->orderByDesc('total')
                ->get() as $row) {
                if ((int) $row->total > 0) {
                    $this->line("  {$row->nombre}: {$row->total}");
                }
            }
        }

        return self::SUCCESS;
    }
}
