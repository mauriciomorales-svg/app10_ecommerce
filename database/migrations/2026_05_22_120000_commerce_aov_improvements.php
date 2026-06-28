<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('vale_descuento')) {
            Schema::table('vale_descuento', function (Blueprint $table) {
                if (! Schema::hasColumn('vale_descuento', 'monto_minimo')) {
                    $table->unsignedInteger('monto_minimo')->default(0)->after('valor');
                }
                if (! Schema::hasColumn('vale_descuento', 'solo_primera_compra')) {
                    $table->boolean('solo_primera_compra')->default(false)->after('monto_minimo');
                }
                if (! Schema::hasColumn('vale_descuento', 'hora_inicio')) {
                    $table->unsignedTinyInteger('hora_inicio')->nullable()->after('solo_primera_compra');
                }
                if (! Schema::hasColumn('vale_descuento', 'hora_fin')) {
                    $table->unsignedTinyInteger('hora_fin')->nullable()->after('hora_inicio');
                }
            });
        }

        if (! Schema::hasTable('vale_descuento_uso')) {
            Schema::create('vale_descuento_uso', function (Blueprint $table) {
                $table->id();
                $table->string('codigo', 50)->index();
                $table->unsignedInteger('idventa')->nullable()->index();
                $table->string('email', 120)->nullable()->index();
                $table->string('telefono', 32)->nullable();
                $table->unsignedInteger('descuento_clp')->default(0);
                $table->timestamp('created_at')->useCurrent();
            });
        }

        if (! Schema::hasTable('commerce_events')) {
            Schema::create('commerce_events', function (Blueprint $table) {
                $table->id();
                $table->string('event', 64)->index();
                $table->json('payload')->nullable();
                $table->string('session_id', 64)->nullable()->index();
                $table->string('page', 255)->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('commerce_events');
        Schema::dropIfExists('vale_descuento_uso');

        if (Schema::hasTable('vale_descuento')) {
            Schema::table('vale_descuento', function (Blueprint $table) {
                foreach (['hora_fin', 'hora_inicio', 'solo_primera_compra', 'monto_minimo'] as $col) {
                    if (Schema::hasColumn('vale_descuento', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
