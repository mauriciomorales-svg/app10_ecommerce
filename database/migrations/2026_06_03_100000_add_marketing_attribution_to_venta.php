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
            if (! Schema::hasColumn('venta', 'utm_source')) {
                $table->string('utm_source', 64)->nullable()->after('observaciones');
            }
            if (! Schema::hasColumn('venta', 'utm_medium')) {
                $table->string('utm_medium', 64)->nullable()->after('utm_source');
            }
            if (! Schema::hasColumn('venta', 'utm_campaign')) {
                $table->string('utm_campaign', 128)->nullable()->after('utm_medium');
            }
            if (! Schema::hasColumn('venta', 'referrer')) {
                $table->string('referrer', 512)->nullable()->after('utm_campaign');
            }
            if (! Schema::hasColumn('venta', 'landing_path')) {
                $table->string('landing_path', 255)->nullable()->after('referrer');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('venta')) {
            return;
        }

        Schema::table('venta', function (Blueprint $table) {
            foreach (['landing_path', 'referrer', 'utm_campaign', 'utm_medium', 'utm_source'] as $col) {
                if (Schema::hasColumn('venta', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
