<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('commerce_events')) {
            return;
        }

        Schema::table('commerce_events', function (Blueprint $table) {
            $table->index(['event', 'created_at'], 'commerce_events_event_created_idx');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('commerce_events')) {
            return;
        }

        Schema::table('commerce_events', function (Blueprint $table) {
            $table->dropIndex('commerce_events_event_created_idx');
        });
    }
};
