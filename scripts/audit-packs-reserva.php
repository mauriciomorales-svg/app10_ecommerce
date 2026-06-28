<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$cfg = (array) config('packs_reserva.secciones', []);

echo "=== AUDITORÍA /packs (packs_reserva.php × BD) ===\n\n";

$totales = ['items' => 0, 'con_id' => 0, 'venta_web' => 0, 'stock_ok' => 0, 'con_imagen_cfg' => 0];

foreach ($cfg as $sec) {
    echo strtoupper($sec['id']) . ' — ' . ($sec['titulo'] ?? '') . "\n";
    foreach ((array) ($sec['items'] ?? []) as $item) {
        $totales['items']++;
        $nombreBd = (string) ($item['nombre'] ?? '');
        $rows = DB::table('productos')
            ->where('nombre', $nombreBd)
            ->where('activo', true)
            ->orderByDesc('idproducto')
            ->get(['idproducto', 'venta_web', 'stock_actual', 'precio']);

        $best = null;
        $bestScore = -1;
        foreach ($rows as $r) {
            $id = (int) $r->idproducto;
            if ($id >= 1909 && $id <= 1932) {
                continue;
            }
            $comp = DB::table('producto_composicion')->where('id_pack', $id)->count();
            $opts = DB::table('product_bundle_options')->where('parent_product_id', $id)->count();
            $score = ($comp * 10) + $opts;
            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $r;
            }
        }
        if (! $best && $rows->count()) {
            $best = $rows->first();
        }

        $publico = $item['nombre_publico'] ?? $nombreBd;
        $imagenCfg = ! empty($item['imagen']);
        if ($imagenCfg) {
            $totales['con_imagen_cfg']++;
        }

        if ($best) {
            $totales['con_id']++;
            if ($best->venta_web) {
                $totales['venta_web']++;
            }
            if ((int) $best->stock_actual > 0) {
                $totales['stock_ok']++;
            }
            $opts = DB::table('product_bundle_options')->where('parent_product_id', $best->idproducto)->count();
            $comp = DB::table('producto_composicion')->where('id_pack', $best->idproducto)->count();
            $custom = DB::table('customization_fields')->where('product_id', $best->idproducto)->count();

            printf(
                "  • %s\n    id=%d | venta_web=%s | stock=%d | $%s | opts=%d comp=%d custom=%d | img_cfg=%s\n",
                $publico,
                $best->idproducto,
                $best->venta_web ? 'SÍ' : 'NO',
                (int) $best->stock_actual,
                number_format((float) $best->precio, 0, ',', '.'),
                $opts,
                $comp,
                $custom,
                $imagenCfg ? 'SÍ' : 'NO'
            );
        } else {
            printf("  • %s\n    ⚠ SIN PRODUCTO EN BD (nombre: %s)\n", $publico, $nombreBd);
        }
    }
    echo "\n";
}

echo "--- RESUMEN ---\n";
echo "Ítems en config: {$totales['items']}\n";
echo "Con producto BD: {$totales['con_id']}/{$totales['items']}\n";
echo "venta_web=true: {$totales['venta_web']}/{$totales['con_id']}\n";
echo "Con stock>0: {$totales['stock_ok']}/{$totales['con_id']}\n";
echo "Con imagen en config: {$totales['con_imagen_cfg']}/{$totales['items']}\n";
