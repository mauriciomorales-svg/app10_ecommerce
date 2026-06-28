<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('store_search_logs')) {
            return;
        }

        Schema::create('store_search_logs', function (Blueprint $table) {
            $table->id();
            $table->string('query', 255);
            $table->string('query_normalized', 255)->index();
            $table->string('scope', 32)->default('home')->index();
            $table->string('outcome', 32)->index();
            $table->unsignedInteger('total_results')->default(0);
            $table->string('session_id', 64)->nullable()->index();
            $table->string('page', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['created_at', 'outcome']);
            $table->index(['scope', 'outcome', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_search_logs');
    }
};
