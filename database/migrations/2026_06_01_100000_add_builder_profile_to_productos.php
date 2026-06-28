<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('productos', 'builder_profile')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->string('builder_profile', 40)->default('auto')->after('es_pack');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('productos', 'builder_profile')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->dropColumn('builder_profile');
            });
        }
    }
};
