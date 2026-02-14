<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Agregar columna es_pack a productos
        if (!Schema::hasColumn('productos', 'es_pack')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->boolean('es_pack')->default(false)->after('activo');
            });
        }

        // Crear tabla de composición de packs
        if (!Schema::hasTable('producto_composicion')) {
            Schema::create('producto_composicion', function (Blueprint $table) {
                $table->integer('id_pack');
                $table->integer('id_componente');
                $table->integer('cantidad')->default(1);

                $table->foreign('id_pack')->references('idproducto')->on('productos')->onDelete('cascade');
                $table->foreign('id_componente')->references('idproducto')->on('productos')->onDelete('restrict');
                $table->primary(['id_pack', 'id_componente']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('producto_composicion');

        if (Schema::hasColumn('productos', 'es_pack')) {
            Schema::table('productos', function (Blueprint $table) {
                $table->dropColumn('es_pack');
            });
        }
    }
};
