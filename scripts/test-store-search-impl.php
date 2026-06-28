<?php

/**
 * Smoke test: buscador web + analytics store_search_logs.
 * Uso: php scripts/test-store-search-impl.php [--api=https://api.dondemorales.cl]
 */

declare(strict_types=1);

putenv('CACHE_STORE=array');
$_ENV['CACHE_STORE'] = 'array';
$_SERVER['CACHE_STORE'] = 'array';

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\StoreSearchLog;
use App\Services\ProductSearchService;
use App\Services\StoreSearchLogService;
use Illuminate\Support\Facades\Schema;

$apiBase = 'https://www.dondemorales.cl';
foreach ($argv as $arg) {
    if (str_starts_with($arg, '--api=')) {
        $apiBase = rtrim(substr($arg, 6), '/');
    }
}

$ok = 0;
$fail = 0;

function check(bool $cond, string $label): void
{
    global $ok, $fail;
    if ($cond) {
        echo "  OK  {$label}\n";
        $ok++;
    } else {
        echo "  FAIL {$label}\n";
        $fail++;
    }
}

echo "=== Test local: ProductSearchService ===\n";
$search = app(ProductSearchService::class);
check($search->normalizeTerm('Café') === 'cafe', 'normalizeTerm café → cafe');
check($search->normalizeTerm('Niño') === 'nino', 'normalizeTerm niño → nino');
$expanded = $search->expandTerms('chorr');
check(in_array('chorr', $expanded, true), 'expandTerms incluye término original');
check(count($expanded) >= 1, 'expandTerms devuelve al menos 1 término');

echo "\n=== Test local: store_search_logs ===\n";
check(Schema::hasTable('store_search_logs'), 'tabla store_search_logs existe');

$before = StoreSearchLog::query()->count();
$logger = app(StoreSearchLogService::class);
$logger->log('test_smoke_xyz_noexiste', 'regalos', 0, 'test_session_smoke', '/regalos');
$after = StoreSearchLog::query()->count();
check($after > $before, 'StoreSearchLogService inserta registro');

$last = StoreSearchLog::query()->orderByDesc('id')->first();
check($last !== null && $last->outcome === 'not_found', 'último log outcome=not_found');
check($last !== null && $last->scope === 'regalos', 'último log scope=regalos');
check($last !== null && $last->query_normalized === 'test_smoke_xyz_noexiste', 'query_normalized sin tildes');

// Dedupe: segundo log inmediato no debe insertar
$beforeDedupe = StoreSearchLog::query()->count();
$logger->log('test_smoke_xyz_noexiste', 'regalos', 0, 'test_session_smoke', '/regalos');
$afterDedupe = StoreSearchLog::query()->count();
check($afterDedupe === $beforeDedupe, 'dedupe 90s evita duplicado misma sesión');

echo "\n=== Test API remota: {$apiBase} ===\n";

function apiGet(string $url): ?array
{
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 15,
            'header' => "Accept: application/json\r\n",
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);
    $raw = @file_get_contents($url, false, $ctx);
    if ($raw === false) {
        return null;
    }

    return json_decode($raw, true);
}

$suggest = apiGet("{$apiBase}/api/productos/suggest?q=chorr&alcance=salada");
check(is_array($suggest) && isset($suggest['suggestions']), 'GET /api/productos/suggest responde JSON');
$suggestCount = is_array($suggest['suggestions'] ?? null) ? count($suggest['suggestions']) : 0;
check($suggestCount > 0, "suggest «chorr» alcance=salada devuelve {$suggestCount} sugerencias");

if ($suggestCount > 0) {
    $first = $suggest['suggestions'][0];
    check(isset($first['idproducto'], $first['nombre']), 'sugerencia tiene idproducto y nombre');
    check(array_key_exists('es_pack', $first), 'sugerencia incluye campo es_pack');
}

$suggestRegalos = apiGet("{$apiBase}/api/productos/suggest?q=desayuno&alcance=regalos");
$regCount = is_array($suggestRegalos['suggestions'] ?? null) ? count($suggestRegalos['suggestions']) : 0;
check($regCount > 0, "suggest «desayuno» alcance=regalos devuelve {$regCount} sugerencias");

$searchSalada = apiGet("{$apiBase}/api/productos?buscar=chorrillana&alcance=salada&page=1");
check(is_array($searchSalada) && isset($searchSalada['data']), 'GET /api/productos?buscar= busca catálogo');
$saladaTotal = (int) ($searchSalada['total'] ?? 0);
check($saladaTotal > 0, "búsqueda chorrillana salada total={$saladaTotal}");

$searchEmpty = apiGet("{$apiBase}/api/productos?buscar=xyznoexiste_smoke_test&alcance=regalos&page=1&session_id=smoke_test_agent&page_path=/regalos");
$emptyTotal = (int) ($searchEmpty['total'] ?? 0);
check($emptyTotal === 0, 'búsqueda inventada devuelve 0 resultados');

$searchCafe = apiGet("{$apiBase}/api/productos?buscar=cafe&page=1");
$cafeTotal = (int) ($searchCafe['total'] ?? 0);
check($cafeTotal > 0, "búsqueda «cafe» sin tilde total={$cafeTotal} (normalización)");

$searchPacks = apiGet("{$apiBase}/api/productos?buscar=pack&alcance=packs&page=1");
$packsTotal = (int) ($searchPacks['total'] ?? 0);
check($packsTotal > 0, "alcance packs «pack» total={$packsTotal}");

// Web frontend
$webUrls = [
    'https://www.dondemorales.cl/',
    'https://www.dondemorales.cl/regalos',
    'https://www.dondemorales.cl/packs',
];
echo "\n=== Test web (HTTP status) ===\n";
foreach ($webUrls as $url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_NOBODY => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_FOLLOWLOCATION => true,
    ]);
    curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    check($code === 200, "{$url} → HTTP {$code}");
}

echo "\n=== Resumen ===\n";
echo "OK: {$ok} | FAIL: {$fail}\n";
exit($fail > 0 ? 1 : 0);
