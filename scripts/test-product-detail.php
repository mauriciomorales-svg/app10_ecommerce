<?php
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Producto;
use Illuminate\Support\Facades\DB;

$ids = [1912, 1921, 1878, 1880];
foreach ($ids as $id) {
    $p = Producto::with(['categorias', 'bundleOptions', 'customizationFields'])->find($id);
    if (!$p) {
        echo "[$id] NOT FOUND\n";
        continue;
    }
    echo "[$id] {$p->nombre}\n";
    echo "  stock={$p->stock_actual} idcategoria={$p->idcategoria}\n";
    echo "  has_bundle_options={$p->has_bundle_options} bundle_opts={$p->bundleOptions->count()}\n";
    echo "  has_customization={$p->has_customization} custom_fields={$p->customizationFields->count()}\n";
    echo "  categorias_pivot=".$p->categorias->pluck('nombre')->join(', ')."\n";
    if ($p->idcategoria) {
        $cat = DB::table('categoria')->where('idcategoria', $p->idcategoria)->value('nombre');
        echo "  categoria_legacy={$cat}\n";
    }
    echo "\n";
}

// API index transform simulation
$base = 'http://127.0.0.1:8002';
$json = file_get_contents($base.'/api/productos/'.$ids[0]);
$d = json_decode($json, true);
echo "API show 1912 bundle_groups=".count($d['bundle_groups'] ?? [])."\n";

$json2 = file_get_contents($base.'/api/productos/1912/sugerencias');
$sug = json_decode($json2, true);
echo "Sugerencias café: ".count($sug)." items\n";
if (!empty($sug[0])) {
    echo "  first: {$sug[0]['nombre']} - {$sug[0]['mensaje']}\n";
}
