<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('productos', 'venta_web')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->boolean('venta_web')->default(true)->after('activo');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('productos', 'venta_web')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->dropColumn('venta_web');
            });
        }
    }
};
