<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('venta', function (Blueprint $table) {
            if (! Schema::hasColumn('venta', 'jobshours_publish_status')) {
                $table->string('jobshours_publish_status', 32)->nullable()->after('jobshours_request_id');
            }
            if (! Schema::hasColumn('venta', 'jobshours_publish_attempts')) {
                $table->unsignedSmallInteger('jobshours_publish_attempts')->default(0)->after('jobshours_publish_status');
            }
            if (! Schema::hasColumn('venta', 'jobshours_publish_error')) {
                $table->text('jobshours_publish_error')->nullable()->after('jobshours_publish_attempts');
            }
            if (! Schema::hasColumn('venta', 'jobshours_delivery_status')) {
                $table->string('jobshours_delivery_status', 64)->nullable()->after('jobshours_publish_error');
            }
            if (! Schema::hasColumn('venta', 'jobshours_status_synced_at')) {
                $table->timestamp('jobshours_status_synced_at')->nullable()->after('jobshours_delivery_status');
            }
            if (! Schema::hasColumn('venta', 'delivery_notified_at')) {
                $table->timestamp('delivery_notified_at')->nullable()->after('jobshours_status_synced_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('venta', function (Blueprint $table) {
            $cols = [
                'delivery_notified_at',
                'jobshours_status_synced_at',
                'jobshours_delivery_status',
                'jobshours_publish_error',
                'jobshours_publish_attempts',
                'jobshours_publish_status',
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('venta', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
