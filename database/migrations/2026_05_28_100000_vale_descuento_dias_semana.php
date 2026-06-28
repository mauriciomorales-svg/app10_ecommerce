<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('vale_descuento')) {
            return;
        }

        Schema::table('vale_descuento', function (Blueprint $table) {
            if (! Schema::hasColumn('vale_descuento', 'dias_semana')) {
                $table->string('dias_semana', 32)->nullable()->after('hora_fin')
                    ->comment('ISO-8601: 1=lun … 7=dom, ej. 1,2,3,4');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('vale_descuento')) {
            return;
        }

        Schema::table('vale_descuento', function (Blueprint $table) {
            if (Schema::hasColumn('vale_descuento', 'dias_semana')) {
                $table->dropColumn('dias_semana');
            }
        });
    }
};
