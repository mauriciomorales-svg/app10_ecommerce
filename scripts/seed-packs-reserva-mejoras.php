<?php
/**
 * Mejoras auditoría /packs: stock combo estrella + campos tarjeta en regalos.
 *
 *   php scripts/seed-packs-reserva-mejoras.php           # dry-run
 *   php scripts/seed-packs-reserva-mejoras.php --apply
 */

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$apply = in_array('--apply', $argv, true);

$regaloFields = [
    ['key' => 'nombre_destinatario', 'label' => 'Nombre de quien recibe (opcional)', 'type' => 'text', 'required' => false],
    ['key' => 'mensaje_tarjeta', 'label' => 'Mensaje para la tarjeta de saludo', 'type' => 'textarea', 'required' => false],
];

$regaloPackIds = [2116, 2117, 2118, 2119, 2120, 2121];
$comboFamiliarId = 2175;
$condolenciasAbiertoId = 2120;
$condolenciasAbiertoPrecio = 17990;
$condolenciasCerradoNombre = 'Pack Condolencias / Té';
$condolenciasCerradoPrecio = 17990;

/** Packs cerrados regalo — stock virtual para reserva web */
$regalosCerradosNombres = [
    'Pack Desayuno Clásico',
    'Pack Cumpleaños para Mamá',
    'Pack Cumpleaños Dulce',
    'Pack Amor & Espumante',
    'Pack Once Familiar',
    'Pack Condolencias / Té',
    'Pack Corporativo (B2B)',
];

echo "=== seed-packs-reserva-mejoras ===\n";
echo $apply ? "MODO: APPLY\n\n" : "MODO: dry-run (usa --apply)\n\n";

if (! Schema::hasTable('productos')) {
    echo "ERROR: tabla productos no existe.\n";
    exit(1);
}

function ensurePackReservable(bool $apply, int $productId, string $label): void
{
    $p = DB::table('productos')->where('idproducto', $productId)->first(['idproducto', 'nombre', 'stock_actual', 'venta_web', 'activo']);
    if (! $p) {
        echo "  WARN: #{$productId} {$label} — no encontrado\n";
        return;
    }
    echo "  #{$productId} {$p->nombre}\n";
    echo "    stock={$p->stock_actual} venta_web=".($p->venta_web ? 'SÍ' : 'NO').' activo='.($p->activo ? 'SÍ' : 'NO')."\n";
    if ((int) $p->stock_actual <= 0 || ! $p->venta_web || ! $p->activo) {
        if ($apply) {
            DB::table('productos')->where('idproducto', $productId)->update([
                'stock_actual' => 999,
                'venta_web' => true,
                'activo' => true,
            ]);
            echo "    → stock=999, venta_web=true, activo=true\n";
        } else {
            echo "    → se actualizaría stock=999, venta_web=true, activo=true\n";
        }
    } else {
        echo "    → OK\n";
    }
}

$combo = DB::table('productos')->where('idproducto', $comboFamiliarId)->first(['idproducto', 'nombre', 'stock_actual', 'venta_web', 'activo']);
if ($combo) {
    echo "Combo familiar #{$comboFamiliarId}: {$combo->nombre}\n";
    echo "  stock actual: {$combo->stock_actual} | venta_web: ".($combo->venta_web ? 'SÍ' : 'NO')."\n";
    if ((int) $combo->stock_actual <= 0 || ! $combo->venta_web || ! $combo->activo) {
        if ($apply) {
            DB::table('productos')->where('idproducto', $comboFamiliarId)->update([
                'stock_actual' => 999,
                'venta_web' => true,
                'activo' => true,
            ]);
            echo "  → stock=999, venta_web=true, activo=true\n";
        } else {
            echo "  → se actualizaría stock=999, venta_web=true\n";
        }
    } else {
        echo "  → OK\n";
    }
} else {
    echo "WARN: no existe producto #{$comboFamiliarId}\n";
}

echo "\nStock packs regalo cerrados:\n";
foreach ($regalosCerradosNombres as $nombre) {
    $row = DB::table('productos')
        ->where('nombre', $nombre)
        ->where('activo', true)
        ->orderByDesc('idproducto')
        ->first(['idproducto']);
    if ($row) {
        ensurePackReservable($apply, (int) $row->idproducto, $nombre);
    } else {
        echo "  WARN: {$nombre} — sin producto activo (sync packs_regalo_cerrados primero)\n";
    }
}

echo "\nCampos personalización regalo (2116–2121):\n";

if (! Schema::hasTable('customization_fields')) {
    echo "ERROR: tabla customization_fields no existe.\n";
    exit(1);
}

foreach ($regaloPackIds as $productId) {
    $p = DB::table('productos')->where('idproducto', $productId)->value('nombre');
    if (! $p) {
        echo "  #{$productId}: no encontrado — omitido\n";
        continue;
    }

    echo "  #{$productId} {$p}\n";

    foreach ($regaloFields as $i => $field) {
        $exists = DB::table('customization_fields')
            ->where('product_id', $productId)
            ->where('field_key', $field['key'])
            ->exists();

        $payload = [
            'product_id' => $productId,
            'label' => $field['label'],
            'field_key' => $field['key'],
            'field_type' => $field['type'],
            'is_required' => $field['required'],
            'extra_cost' => 0,
            'options' => null,
            'sort_order' => ($i + 1) * 10,
            'updated_at' => now(),
        ];

        if ($apply) {
            if ($exists) {
                DB::table('customization_fields')
                    ->where('product_id', $productId)
                    ->where('field_key', $field['key'])
                    ->update($payload);
                echo "    · {$field['key']} (actualizado)\n";
            } else {
                $payload['created_at'] = now();
                DB::table('customization_fields')->insert($payload);
                echo "    · {$field['key']} (creado)\n";
            }
        } else {
            echo '    · '.$field['key'].($exists ? ' (existe)' : ' (nuevo)')."\n";
        }
    }
}

echo "\nPrecio pack condolencias abierto (#{$condolenciasAbiertoId}):\n";
$cond = DB::table('productos')->where('idproducto', $condolenciasAbiertoId)->first(['idproducto', 'nombre', 'precio']);
if ($cond) {
    echo "  {$cond->nombre} — actual \${$cond->precio} → \${$condolenciasAbiertoPrecio}\n";
    if ((int) $cond->precio !== $condolenciasAbiertoPrecio && $apply) {
        DB::table('productos')->where('idproducto', $condolenciasAbiertoId)->update(['precio' => $condolenciasAbiertoPrecio]);
        echo "  → actualizado\n";
    }
} else {
    echo "  WARN: no encontrado\n";
}

echo "\nPrecio pack condolencias cerrado ({$condolenciasCerradoNombre}):\n";
$condC = DB::table('productos')->where('nombre', $condolenciasCerradoNombre)->first(['idproducto', 'nombre', 'precio']);
if ($condC) {
    echo "  #{$condC->idproducto} — actual \${$condC->precio} → \${$condolenciasCerradoPrecio}\n";
    if ((int) $condC->precio !== $condolenciasCerradoPrecio && $apply) {
        DB::table('productos')->where('idproducto', $condC->idproducto)->update(['precio' => $condolenciasCerradoPrecio]);
        echo "  → actualizado\n";
    }
} else {
    echo "  WARN: no encontrado (sync packs_regalo_cerrados primero)\n";
}

echo "\n".($apply ? 'Listo.' : 'Dry-run terminado.')."\n";
