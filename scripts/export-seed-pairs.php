<?php

/**
 * Genera pares sugeridos desde catálogo actual (origen = más vendidos con stock).
 * Uso: php scripts/export-seed-pairs.php > /tmp/pairs.txt
 */

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$excludeIds = [1909, 1910, 1911, 1912, 1961, 1962, 1963, 1964];
$excludeLike = ['bolsa', 'caja regalo', 'traigo mi bolsa', 'empaque'];

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
    ->limit(25)
    ->get(['idproducto', 'nombre']);

$configPairs = config('cart_suggestions_seed.fixed_pairs', []);
$manualByOrigin = [];
foreach ($configPairs as $p) {
    $manualByOrigin[(int) $p['origen']][] = (int) $p['sugerido'];
}

$rules = [
    ['cats' => ['bebida', 'coca', 'pepsi', 'cerveza', 'jugo', 'agua', 'vital', 'cachantun'], 'suggest' => ['gallet', 'oreo', 'cookie', 'snack', 'papas', 'maní', 'mani'], 'msg' => '¿Snack para acompañar?'],
    ['cats' => ['leche', 'yogur'], 'suggest' => ['pan', 'hallulla', 'marraqueta', 'gallet', 'manjar', 'mermelada', 'nutella'], 'msg' => 'Completa tu desayuno'],
    ['cats' => ['pan', 'hallulla', 'marraqueta'], 'suggest' => ['leche', 'manjar', 'mermelada', 'nutella', 'queso'], 'msg' => 'Para untar o acompañar'],
    ['cats' => ['arroz'], 'suggest' => ['aceite', 'fideo'], 'msg' => 'Para cocinar'],
    ['cats' => ['fideo', 'fideos'], 'suggest' => ['aceite', 'arroz'], 'msg' => 'Complemento cocina'],
    ['cats' => ['yerba'], 'suggest' => ['manjar', 'gallet', 'cookie', 'mermelada'], 'msg' => 'Para la once'],
    ['cats' => ['queso'], 'suggest' => ['pan', 'hallulla', 'gallet'], 'msg' => 'Pan o crackers'],
    ['cats' => ['huevo'], 'suggest' => ['pan', 'palta', 'leche'], 'msg' => 'Desayuno'],
    ['cats' => ['papel hig'], 'suggest' => ['eno', 'jabon', 'detergente'], 'msg' => 'Básicos hogar'],
    ['cats' => ['shampoo', 'prestobarba', 'jabon'], 'suggest' => ['pasta dental', 'desodor', 'trident'], 'msg' => 'Higiene personal'],
];

function findByTerms(array $terms, ?int $exclude, array $excludeIds, array $excludeLike): ?int
{
    foreach ($terms as $t) {
        $q = DB::table('productos')
            ->where('stock_actual', '>', 0)
            ->whereNotIn('idproducto', $excludeIds)
            ->where('nombre', 'ilike', "%{$t}%");
        foreach ($excludeLike as $ex) {
            $q->where('nombre', 'not ilike', "%{$ex}%");
        }
        if ($exclude) {
            $q->where('idproducto', '!=', $exclude);
        }
        $id = $q->orderByDesc('veces_vendido')->value('idproducto');
        if ($id) {
            return (int) $id;
        }
    }

    return null;
}

function originMatches(string $nombre, array $terms): bool
{
    $n = mb_strtolower($nombre);
    foreach ($terms as $t) {
        if (str_contains($n, mb_strtolower($t))) {
            return true;
        }
    }

    return false;
}

$generated = [];
$seen = [];

foreach ($origins as $origin) {
    $oid = (int) $origin->idproducto;
    $nombre = (string) $origin->nombre;

    foreach ($rules as $rule) {
        if (! originMatches($nombre, $rule['cats'])) {
            continue;
        }
        $added = 0;
        foreach ($rule['suggest'] as $term) {
            $sid = findByTerms([$term], $oid, $excludeIds, $excludeLike);
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

// Mantener pares manuales curados (prioridad)
$merged = [];
$keys = [];
foreach ($configPairs as $p) {
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

echo "Total pares: ".count($merged).PHP_EOL.PHP_EOL;
foreach ($merged as $p) {
    $on = DB::table('productos')->where('idproducto', $p['origen'])->value('nombre');
    $sn = DB::table('productos')->where('idproducto', $p['sugerido'])->value('nombre');
    echo sprintf(
        "        ['origen' => %d, 'sugerido' => %d, 'mensaje' => '%s', 'tipo' => 'complemento', 'orden' => %d], // %s → %s\n",
        $p['origen'],
        $p['sugerido'],
        addslashes($p['mensaje']),
        $p['orden'] ?? 1,
        mb_substr((string) $on, 0, 35),
        mb_substr((string) $sn, 0, 35)
    );
}
