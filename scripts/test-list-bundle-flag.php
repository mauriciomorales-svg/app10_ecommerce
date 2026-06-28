<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$base = 'http://127.0.0.1:8002';
foreach ([1912, 1921] as $id) {
    $found = false;
    for ($page = 1; $page <= 80; $page++) {
        $d = json_decode(file_get_contents("{$base}/api/productos?page={$page}"), true);
        foreach ($d['data'] ?? [] as $p) {
            if ((int) $p['idproducto'] === $id) {
                echo "List page {$page}: [{$id}] bundle=".json_encode($p['has_bundle_options'] ?? null)." custom=".json_encode($p['has_customization'] ?? null)."\n";
                $found = true;
                break 2;
            }
        }
        if (($d['current_page'] ?? 0) >= ($d['last_page'] ?? 0)) {
            break;
        }
    }
    if (!$found) {
        echo "[$id] NOT in list (maybe filtered by store scope?)\n";
    }
}
