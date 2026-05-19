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
            if (! Schema::hasColumn('venta', 'fulfillment_type')) {
                $table->string('fulfillment_type', 16)->default('pickup')->after('estado_retiro');
            }
            if (! Schema::hasColumn('venta', 'delivery_amount')) {
                $table->decimal('delivery_amount', 12, 0)->default(0)->after('fulfillment_type');
            }
            if (! Schema::hasColumn('venta', 'delivery_address')) {
                $table->string('delivery_address', 500)->nullable()->after('delivery_amount');
            }
            if (! Schema::hasColumn('venta', 'delivery_lat')) {
                $table->decimal('delivery_lat', 10, 7)->nullable()->after('delivery_address');
            }
            if (! Schema::hasColumn('venta', 'delivery_lng')) {
                $table->decimal('delivery_lng', 10, 7)->nullable()->after('delivery_lat');
            }
            if (! Schema::hasColumn('venta', 'delivery_distance_km')) {
                $table->decimal('delivery_distance_km', 8, 2)->nullable()->after('delivery_lng');
            }
            if (! Schema::hasColumn('venta', 'jobshours_request_id')) {
                $table->unsignedBigInteger('jobshours_request_id')->nullable()->after('delivery_distance_km');
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
                'jobshours_request_id',
                'delivery_distance_km',
                'delivery_lng',
                'delivery_lat',
                'delivery_address',
                'delivery_amount',
                'fulfillment_type',
            ] as $col) {
                if (Schema::hasColumn('venta', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
