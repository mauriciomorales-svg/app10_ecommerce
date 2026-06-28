<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SeedDefaultCouponsCommand extends Command
{
    protected $signature = 'commerce:seed-coupons {--force : Sobrescribir si el código ya existe}';

    protected $description = 'Crea cupones de ejemplo en vale_descuento (solo si no existen)';

    public function handle(): int
    {
        if (! Schema::hasTable('vale_descuento')) {
            $this->error('Tabla vale_descuento no existe.');

            return self::FAILURE;
        }

        $coupons = [
            [
                'codigo' => 'MORALESWEB10',
                'tipo' => 'PORCENTAJE',
                'valor' => 10,
                'descripcion' => '10% primera compra web (campaña Facebook)',
                'usos_maximos' => 1000,
                'monto_minimo' => 5000,
                'solo_primera_compra' => true,
                'fecha_fin' => now()->addMonths(3)->toDateString(),
            ],
            [
                'codigo' => 'BIENVENIDO10',
                'tipo' => 'PORCENTAJE',
                'valor' => 10,
                'descripcion' => '10% en tu primera compra web',
                'usos_maximos' => 500,
                'monto_minimo' => 5000,
                'solo_primera_compra' => true,
            ],
            [
                'codigo' => 'RENAICO2000',
                'tipo' => 'MONTO',
                'valor' => 2000,
                'descripcion' => '$2.000 de descuento (mín. $15.000 en productos)',
                'usos_maximos' => 200,
                'monto_minimo' => 15000,
                'solo_primera_compra' => false,
            ],
            [
                'codigo' => 'COMBOSEMANA',
                'tipo' => 'MONTO',
                'valor' => 500,
                'descripcion' => '$500 en yogurt con fruta o combo de la semana (lun–jue 15:00–17:00)',
                'usos_maximos' => 2000,
                'monto_minimo' => 2800,
                'solo_primera_compra' => false,
                'hora_inicio' => 15,
                'hora_fin' => 17,
                'dias_semana' => '1,2,3,4',
            ],
        ];

        /** Cupones Toppi's agresivos — desactivados (márgen > promos masivas) */
        $retired = ['WHATSAPP3000', 'TOPPISLANZA'];

        foreach ($coupons as $c) {
            $exists = DB::table('vale_descuento')->whereRaw('UPPER(codigo) = ?', [strtoupper($c['codigo'])])->exists();
            $row = [
                'tipo' => $c['tipo'],
                'valor' => $c['valor'],
                'descripcion' => $c['descripcion'],
                'usos_maximos' => $c['usos_maximos'],
                'activo' => true,
                'updated_at' => now(),
            ];
            if (Schema::hasColumn('vale_descuento', 'monto_minimo')) {
                $row['monto_minimo'] = $c['monto_minimo'];
            }
            if (Schema::hasColumn('vale_descuento', 'solo_primera_compra')) {
                $row['solo_primera_compra'] = $c['solo_primera_compra'];
            }
            if (Schema::hasColumn('vale_descuento', 'hora_inicio') && array_key_exists('hora_inicio', $c)) {
                $row['hora_inicio'] = $c['hora_inicio'];
            }
            if (Schema::hasColumn('vale_descuento', 'hora_fin') && array_key_exists('hora_fin', $c)) {
                $row['hora_fin'] = $c['hora_fin'];
            }
            if (Schema::hasColumn('vale_descuento', 'dias_semana') && array_key_exists('dias_semana', $c)) {
                $row['dias_semana'] = $c['dias_semana'];
            }
            if (Schema::hasColumn('vale_descuento', 'fecha_fin') && array_key_exists('fecha_fin', $c)) {
                $row['fecha_fin'] = $c['fecha_fin'];
            }
            if (Schema::hasColumn('vale_descuento', 'fecha_inicio') && array_key_exists('fecha_inicio', $c)) {
                $row['fecha_inicio'] = $c['fecha_inicio'];
            }

            if ($exists && ! $this->option('force')) {
                $this->line("Omitido (ya existe): {$c['codigo']}");

                continue;
            }

            if ($exists) {
                DB::table('vale_descuento')->whereRaw('UPPER(codigo) = ?', [strtoupper($c['codigo'])])->update($row);
            } else {
                DB::table('vale_descuento')->insert(array_merge($row, [
                    'codigo' => $c['codigo'],
                    'fecha_inicio' => $c['fecha_inicio'] ?? null,
                    'fecha_fin' => $c['fecha_fin'] ?? null,
                    'usos_actuales' => 0,
                    'created_at' => now(),
                ]));
            }

            $this->info("Cupón listo: {$c['codigo']}");
        }

        DB::table('vale_descuento')
            ->whereIn(DB::raw('UPPER(codigo)'), array_map('strtoupper', $retired))
            ->update(['activo' => false, 'updated_at' => now()]);
        foreach ($retired as $code) {
            $this->warn("Cupón retirado (inactivo): {$code}");
        }

        return self::SUCCESS;
    }
}
