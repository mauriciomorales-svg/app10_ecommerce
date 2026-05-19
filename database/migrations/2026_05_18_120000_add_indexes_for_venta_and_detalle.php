<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('venta')) {
            Schema::table('venta', function (Blueprint $table) {
                if (Schema::hasColumn('venta', 'estado') && ! $this->hasIndex('venta', 'venta_estado_index')) {
                    $table->index('estado', 'venta_estado_index');
                }
                if (Schema::hasColumn('venta', 'fecha_retiro') && ! $this->hasIndex('venta', 'venta_fecha_retiro_index')) {
                    $table->index('fecha_retiro', 'venta_fecha_retiro_index');
                }
            });
        }

        if (Schema::hasTable('detalle_venta')) {
            Schema::table('detalle_venta', function (Blueprint $table) {
                if (! $this->hasIndex('detalle_venta', 'detalle_venta_idventa_index')) {
                    $table->index('idventa', 'detalle_venta_idventa_index');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('venta')) {
            Schema::table('venta', function (Blueprint $table) {
                $table->dropIndex('venta_estado_index');
                $table->dropIndex('venta_fecha_retiro_index');
            });
        }
        if (Schema::hasTable('detalle_venta')) {
            Schema::table('detalle_venta', function (Blueprint $table) {
                $table->dropIndex('detalle_venta_idventa_index');
            });
        }
    }

    private function hasIndex(string $table, string $indexName): bool
    {
        $connection = Schema::getConnection();
        $driver = $connection->getDriverName();

        if ($driver === 'pgsql') {
            $row = $connection->selectOne(
                'SELECT 1 FROM pg_indexes WHERE tablename = ? AND indexname = ?',
                [$table, $indexName]
            );

            return $row !== null;
        }

        return false;
    }
};
