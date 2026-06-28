<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class CartSuggestionSeedSync
{
    /**
     * @return array{
     *   pairs: array<int, array{origen: int, sugerido: int, mensaje: string, tipo: string, orden: int}>,
     *   stats: array{manual: int, generated: int, total: int}
     * }
     */
    public static function buildPairs(): array
    {
        $config = config('cart_suggestions_seed', []);
        $excludeIds = (array) ($config['exclude_product_ids'] ?? []);
        $excludeLike = ['bolsa', 'caja regalo', 'traigo mi bolsa', 'empaque'];
        $manual = $config['fixed_pairs'] ?? [];

        $origins = DB::table('productos')
            ->where('stock_actual', '>', 0)
            ->whereNotIn('idproducto', $excludeIds)
            ->where(function ($q) use ($excludeLike) {
                foreach ($excludeLike as $t) {
                    $q->where('nombre', 'not ilike', "%{$t}%");
                }
            })
            ->orderByDesc('veces_vendido')
            ->orderBy('nombre')
            ->limit(30)
            ->get(['idproducto', 'nombre']);

        $rules = [
            ['cats' => ['coca', 'pepsi', 'sprite', 'fanta', 'bebida', 'jugo', 'agua', 'vital', 'cachantun'], 'suggest' => ['gallet', 'oreo', 'cookie', 'snack'], 'msg' => '¿Snack para acompañar?'],
            ['cats' => ['cerveza', 'quilmes', 'corona', 'escudo'], 'suggest' => ['gallet', 'oreo', 'cookie', 'snack'], 'msg' => 'Picoteo ideal'],
            ['cats' => ['leche', 'yogur', 'yogurt'], 'suggest' => ['pan', 'hallulla', 'marraqueta', 'gallet', 'manjar', 'nutella'], 'msg' => 'Completa tu desayuno'],
            ['cats' => ['pan lactal', 'pan '], 'suggest' => ['leche', 'manjar', 'mermelada', 'nutella', 'queso'], 'msg' => 'Para untar o acompañar'],
            ['cats' => ['hallulla', 'marraqueta'], 'suggest' => ['leche', 'manjar', 'mermelada'], 'msg' => 'Para untar'],
            ['cats' => ['arroz'], 'suggest' => ['aceite', 'fideo'], 'msg' => 'Para cocinar'],
            ['cats' => ['fideo', 'fideos'], 'suggest' => ['aceite', 'arroz'], 'msg' => 'Complemento cocina'],
            ['cats' => ['yerba'], 'suggest' => ['manjar', 'gallet', 'cookie', 'mermelada'], 'msg' => 'Para la once'],
            ['cats' => ['queso'], 'suggest' => ['pan', 'hallulla', 'gallet'], 'msg' => 'Pan o crackers'],
            ['cats' => ['huevo'], 'suggest' => ['pan', 'palta', 'leche'], 'msg' => 'Desayuno'],
            ['cats' => ['nutella', 'manjar', 'mermelada'], 'suggest' => ['pan', 'hallulla', 'marraqueta'], 'msg' => 'Pan para untar'],
            ['cats' => ['gallet', 'oreo', 'cookie'], 'suggest' => ['coca', 'jugo', 'leche', 'vital'], 'msg' => '¿Bebida?'],
            ['cats' => ['aceite'], 'suggest' => ['arroz', 'fideo'], 'msg' => 'Abarrotes básicos'],
            ['cats' => ['papel hig'], 'suggest' => ['eno', 'jabon'], 'msg' => 'Básicos del hogar'],
            ['cats' => ['prestobarba', 'shampoo', 'jabon'], 'suggest' => ['trident', 'pasta dental', 'desodor'], 'msg' => 'Higiene personal'],
            ['cats' => ['frutas'], 'suggest' => ['verduras', 'jugo'], 'msg' => 'Frescos'],
            ['cats' => ['verduras'], 'suggest' => ['frutas', 'aceite'], 'msg' => 'Para cocinar'],
        ];

        $generated = [];
        $seen = [];

        foreach ($origins as $origin) {
            $oid = (int) $origin->idproducto;
            $nombre = (string) $origin->nombre;

            foreach ($rules as $rule) {
                if (! self::nameMatches($nombre, $rule['cats'])) {
                    continue;
                }
                $added = 0;
                foreach ($rule['suggest'] as $term) {
                    $sid = self::findProductId($term, $oid, $excludeIds, $excludeLike);
                    if (! $sid || isset($seen["{$oid}-{$sid}"])) {
                        continue;
                    }
                    $seen["{$oid}-{$sid}"] = true;
                    $generated[] = [
                        'origen' => $oid,
                        'sugerido' => $sid,
                        'mensaje' => $rule['msg'],
                        'tipo' => 'complemento',
                        'orden' => $added + 1,
                    ];
                    $added++;
                    if ($added >= 2) {
                        break 2;
                    }
                }
            }
        }

        $merged = [];
        $keys = [];
        foreach ($manual as $p) {
            $k = $p['origen'].'-'.$p['sugerido'];
            $keys[$k] = true;
            $merged[] = $p;
        }
        foreach ($generated as $p) {
            $k = $p['origen'].'-'.$p['sugerido'];
            if (isset($keys[$k])) {
                continue;
            }
            $keys[$k] = true;
            $merged[] = $p;
        }

        return [
            'pairs' => $merged,
            'stats' => [
                'manual' => count($manual),
                'generated' => count($generated),
                'total' => count($merged),
            ],
        ];
    }

    /**
     * @param  array<int, array{origen: int, sugerido: int, mensaje: string, tipo: string, orden: int}>  $pairs
     * @return array{created: int, updated: int, skipped: int}
     */
    public static function upsertPairs(array $pairs, bool $force = true): array
    {
        $excludeIds = (array) config('cart_suggestions_seed.exclude_product_ids', []);
        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($pairs as $pair) {
            $origen = (int) $pair['origen'];
            $sugerido = (int) $pair['sugerido'];
            if ($origen === $sugerido || in_array($origen, $excludeIds, true) || in_array($sugerido, $excludeIds, true)) {
                $skipped++;

                continue;
            }
            if (! self::productInStock($origen) || ! self::productInStock($sugerido)) {
                $skipped++;

                continue;
            }

            $exists = DB::table('producto_sugerencias')
                ->where('producto_origen_id', $origen)
                ->where('producto_sugerido_id', $sugerido)
                ->exists();

            $payload = [
                'mensaje' => (string) ($pair['mensaje'] ?? 'Te puede interesar'),
                'tipo' => (string) ($pair['tipo'] ?? 'complemento'),
                'orden' => (int) ($pair['orden'] ?? 1),
                'activo' => true,
                'updated_at' => now(),
            ];

            if ($exists) {
                if ($force) {
                    DB::table('producto_sugerencias')
                        ->where('producto_origen_id', $origen)
                        ->where('producto_sugerido_id', $sugerido)
                        ->update($payload);
                    $updated++;
                } else {
                    $skipped++;
                }
            } else {
                DB::table('producto_sugerencias')->insert(array_merge($payload, [
                    'producto_origen_id' => $origen,
                    'producto_sugerido_id' => $sugerido,
                    'created_at' => now(),
                ]));
                $created++;
            }
        }

        return compact('created', 'updated', 'skipped');
    }

    /**
     * @param  array<int>  $excludeIds
     * @param  array<int, string>  $excludeLike
     */
    private static function findProductId(string $pattern, ?int $excludeId, array $excludeIds, array $excludeLike): ?int
    {
        $q = DB::table('productos')
            ->where('stock_actual', '>', 0)
            ->whereNotIn('idproducto', $excludeIds)
            ->where('nombre', 'ilike', "%{$pattern}%");
        foreach ($excludeLike as $ex) {
            $q->where('nombre', 'not ilike', "%{$ex}%");
        }
        if ($excludeId) {
            $q->where('idproducto', '!=', $excludeId);
        }

        $id = $q->orderByDesc('veces_vendido')->value('idproducto');

        return $id ? (int) $id : null;
    }

    private static function productInStock(int $id): bool
    {
        return DB::table('productos')->where('idproducto', $id)->where('stock_actual', '>', 0)->exists();
    }

    /**
     * @param  array<int, string>  $terms
     */
    private static function nameMatches(string $nombre, array $terms): bool
    {
        $n = mb_strtolower($nombre);
        foreach ($terms as $t) {
            if (str_contains($n, mb_strtolower($t))) {
                return true;
            }
        }

        return false;
    }
}
