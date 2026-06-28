<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SeedCartSuggestionsCommand extends Command
{
    protected $signature = 'commerce:seed-cart-suggestions
                            {--force : Actualizar mensaje/orden si el par ya existe}
                            {--dry-run : Solo mostrar qué se insertaría}
                            {--discover : Resolver pattern_pairs y listar IDs encontrados}';

    protected $description = 'Carga pares fijos y por patrón en producto_sugerencias (minimarket Renaico)';

    public function handle(): int
    {
        if (! Schema::hasTable('producto_sugerencias')) {
            $this->error('Tabla producto_sugerencias no existe.');

            return self::FAILURE;
        }

        $config = config('cart_suggestions_seed', []);
        $excludeIds = (array) ($config['exclude_product_ids'] ?? []);

        if ($this->option('discover')) {
            return $this->discoverPatterns($config['pattern_pairs'] ?? [], $excludeIds);
        }

        $created = 0;
        $skipped = 0;

        foreach ($config['fixed_pairs'] ?? [] as $pair) {
            $result = $this->upsertPair(
                (int) $pair['origen'],
                (int) $pair['sugerido'],
                (string) ($pair['mensaje'] ?? 'Te puede interesar'),
                (string) ($pair['tipo'] ?? 'complemento'),
                (int) ($pair['orden'] ?? 1),
                $excludeIds
            );
            if ($result === 'created' || $result === 'updated') {
                $created++;
            } else {
                $skipped++;
            }
        }

        foreach ($config['pattern_pairs'] ?? [] as $rule) {
            $origen = $this->findProductId((string) ($rule['origen'] ?? ''), null, $excludeIds);
            $sugerido = $this->findProductId(
                (string) ($rule['sugerido'] ?? ''),
                $origen,
                $excludeIds
            );
            if (! $origen || ! $sugerido) {
                continue;
            }

            $result = $this->upsertPair(
                $origen,
                $sugerido,
                (string) ($rule['mensaje'] ?? 'Te puede interesar'),
                (string) ($rule['tipo'] ?? 'complemento'),
                5,
                $excludeIds
            );
            if ($result === 'created' || $result === 'updated') {
                $created++;
            }
        }

        $this->info("Sugerencias creadas/actualizadas: {$created}");
        if ($skipped > 0) {
            $this->line("Omitidas (origen/sugerido inválido o empaque): {$skipped}");
        }

        return self::SUCCESS;
    }

    /**
     * @param  array<int>  $excludeIds
     */
    private function upsertPair(
        int $origen,
        int $sugerido,
        string $mensaje,
        string $tipo,
        int $orden,
        array $excludeIds
    ): string {
        if ($origen === $sugerido || in_array($origen, $excludeIds, true) || in_array($sugerido, $excludeIds, true)) {
            return 'skip';
        }

        if (! $this->productExists($origen) || ! $this->productExists($sugerido)) {
            $this->warn("Omitido (sin stock o no existe): {$origen} -> {$sugerido}");

            return 'skip';
        }

        if ($this->option('dry-run')) {
            $this->line("[dry-run] {$origen} -> {$sugerido}: {$mensaje}");

            return 'created';
        }

        $exists = DB::table('producto_sugerencias')
            ->where('producto_origen_id', $origen)
            ->where('producto_sugerido_id', $sugerido)
            ->exists();

        if ($exists && ! $this->option('force')) {
            return 'skip';
        }

        $payload = [
            'mensaje' => $mensaje,
            'tipo' => $tipo,
            'orden' => $orden,
            'activo' => true,
            'updated_at' => now(),
        ];

        if ($exists) {
            DB::table('producto_sugerencias')
                ->where('producto_origen_id', $origen)
                ->where('producto_sugerido_id', $sugerido)
                ->update($payload);

            return 'updated';
        }

        DB::table('producto_sugerencias')->insert(array_merge($payload, [
            'producto_origen_id' => $origen,
            'producto_sugerido_id' => $sugerido,
            'created_at' => now(),
        ]));

        return 'created';
    }

    private function productExists(int $id): bool
    {
        return DB::table('productos')
            ->where('idproducto', $id)
            ->where('stock_actual', '>', 0)
            ->exists();
    }

    /**
     * @param  array<int>  $excludeIds
     */
    private function findProductId(string $pattern, ?int $excludeId, array $excludeIds): ?int
    {
        $q = DB::table('productos')
            ->where('stock_actual', '>', 0)
            ->where('nombre', 'ilike', $pattern)
            ->whereNotIn('idproducto', $excludeIds)
            ->orderByDesc('veces_vendido');

        if ($excludeId) {
            $q->where('idproducto', '!=', $excludeId);
        }

        $id = $q->value('idproducto');

        return $id ? (int) $id : null;
    }

    /**
     * @param  array<int, array<string, string>>  $patterns
     * @param  array<int>  $excludeIds
     */
    private function discoverPatterns(array $patterns, array $excludeIds): int
    {
        $this->info('Pares resueltos por patrón (para copiar a fixed_pairs):');
        foreach ($patterns as $rule) {
            $origen = $this->findProductId((string) ($rule['origen'] ?? ''), null, $excludeIds);
            $sugerido = $this->findProductId((string) ($rule['sugerido'] ?? ''), $origen, $excludeIds);
            if (! $origen || ! $sugerido) {
                continue;
            }
            $this->line(sprintf(
                "['origen' => %d, 'sugerido' => %d, 'mensaje' => '%s', 'tipo' => 'complemento', 'orden' => 1],",
                $origen,
                $sugerido,
                addslashes((string) ($rule['mensaje'] ?? ''))
            ));
        }

        return self::SUCCESS;
    }
}
