<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commerce_stores', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('name', 160);
            $table->string('primary_host', 191)->nullable()->unique();
            $table->text('host_aliases')->nullable();
            $table->json('settings')->nullable();
            $table->boolean('active')->default(true);
            $table->boolean('is_template')->default(false);
            $table->timestamps();
        });

        $defaultId = DB::table('commerce_stores')->insertGetId([
            'slug' => 'default',
            'name' => 'Catálogo principal',
            'primary_host' => null,
            'host_aliases' => null,
            'settings' => null,
            'active' => true,
            'is_template' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        if (! Schema::hasTable('productos')) {
            return;
        }

        Schema::table('productos', function (Blueprint $table) {
            if (! Schema::hasColumn('productos', 'commerce_store_id')) {
                $table->unsignedBigInteger('commerce_store_id')->nullable()->index();
            }
        });

        DB::table('productos')->whereNull('commerce_store_id')->update(['commerce_store_id' => $defaultId]);
    }

    public function down(): void
    {
        if (Schema::hasTable('productos') && Schema::hasColumn('productos', 'commerce_store_id')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->dropColumn('commerce_store_id');
            });
        }

        Schema::dropIfExists('commerce_stores');
    }
};
