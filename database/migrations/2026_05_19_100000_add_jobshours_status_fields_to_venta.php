<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('venta', function (Blueprint $table) {
            if (! Schema::hasColumn('venta', 'jobshours_request_status')) {
                $table->string('jobshours_request_status', 32)->nullable()->after('jobshours_delivery_status');
            }
            if (! Schema::hasColumn('venta', 'jobshours_payment_status')) {
                $table->string('jobshours_payment_status', 32)->nullable()->after('jobshours_request_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('venta', function (Blueprint $table) {
            $cols = ['jobshours_payment_status', 'jobshours_request_status'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('venta', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
