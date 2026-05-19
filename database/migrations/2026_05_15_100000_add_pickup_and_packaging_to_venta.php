<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('venta')) {
            return;
        }

        Schema::table('venta', function (Blueprint $table) {
            if (! Schema::hasColumn('venta', 'cliente_nombre')) {
                $table->string('cliente_nombre', 120)->nullable()->after('observaciones');
            }
            if (! Schema::hasColumn('venta', 'cliente_email')) {
                $table->string('cliente_email', 120)->nullable()->after('cliente_nombre');
            }
            if (! Schema::hasColumn('venta', 'cliente_telefono')) {
                $table->string('cliente_telefono', 32)->nullable()->after('cliente_email');
            }
            if (! Schema::hasColumn('venta', 'fecha_retiro')) {
                $table->date('fecha_retiro')->nullable()->after('cliente_telefono');
            }
            if (! Schema::hasColumn('venta', 'codigo_retiro')) {
                $table->string('codigo_retiro', 12)->nullable()->unique()->after('fecha_retiro');
            }
            if (! Schema::hasColumn('venta', 'packaging_key')) {
                $table->string('packaging_key', 32)->nullable()->after('codigo_retiro');
            }
            if (! Schema::hasColumn('venta', 'packaging_label')) {
                $table->string('packaging_label', 120)->nullable()->after('packaging_key');
            }
            if (! Schema::hasColumn('venta', 'packaging_amount')) {
                $table->decimal('packaging_amount', 12, 0)->default(0)->after('packaging_label');
            }
            if (! Schema::hasColumn('venta', 'subtotal_productos')) {
                $table->decimal('subtotal_productos', 12, 0)->nullable()->after('packaging_amount');
            }
            if (! Schema::hasColumn('venta', 'estado_retiro')) {
                $table->string('estado_retiro', 32)->default('pendiente_preparacion')->after('subtotal_productos');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('venta')) {
            return;
        }

        Schema::table('venta', function (Blueprint $table) {
            foreach ([
                'estado_retiro',
                'subtotal_productos',
                'packaging_amount',
                'packaging_label',
                'packaging_key',
                'codigo_retiro',
                'fecha_retiro',
                'cliente_telefono',
                'cliente_email',
                'cliente_nombre',
            ] as $col) {
                if (Schema::hasColumn('venta', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
