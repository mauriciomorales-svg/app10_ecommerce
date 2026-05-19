<?php

namespace App\Console\Commands;

use App\Support\CurrentCommerceStore;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class EnsurePackagingProductsCommand extends Command
{
    protected $signature = 'commerce:ensure-packaging-products';

    protected $description = 'Crea categoría y productos SKU de empaque (PACK-*) si no existen';

    public function handle(): int
    {
        if (! Schema::hasTable('productos')) {
            $this->error('Tabla productos no existe.');

            return 1;
        }

        $categoriaId = $this->ensureCategory();
        $storeId = CurrentCommerceStore::id();

        foreach (config('packaging.options', []) as $key => $opt) {
            $barcode = (string) ($opt['barcode'] ?? '');
            if ($barcode === '') {
                continue;
            }

            $q = DB::table('productos')->where('codigobarra', $barcode);
            if ($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id')) {
                $q->where('commerce_store_id', $storeId);
            }

            if ($q->exists()) {
                $this->line("OK {$barcode}");

                continue;
            }

            $data = [
                'nombre' => $opt['label'] ?? $key,
                'descripcion' => $opt['description'] ?? 'Servicio de empaque',
                'codigobarra' => $barcode,
                'precio' => (int) ($opt['amount'] ?? 0),
                'precio_costo' => 0,
                'stock_actual' => 500,
                'stock_minimo' => 10,
                'activo' => true,
                'es_pack' => false,
                'idcategoria' => $categoriaId,
            ];

            if (Schema::hasColumn('productos', 'created_at')) {
                $data['created_at'] = now();
                $data['updated_at'] = now();
            }

            if ($storeId !== null && Schema::hasColumn('productos', 'commerce_store_id')) {
                $data['commerce_store_id'] = $storeId;
            }

            DB::table('productos')->insert($data);
            $this->info("Creado {$barcode} — {$data['nombre']}");
        }

        $this->info('Productos de empaque listos.');

        return 0;
    }

    private function ensureCategory(): ?int
    {
        if (! Schema::hasTable('categoria')) {
            return null;
        }

        $name = 'Empaque y regalo';
        $row = DB::table('categoria')->where('nombre', $name)->first();
        if ($row) {
            return (int) $row->idcategoria;
        }

        $category = [
            'nombre' => $name,
            'descripcion' => 'Bolsas, cajas y materiales de retiro',
            'activo' => true,
        ];

        if (Schema::hasColumn('categoria', 'created_at')) {
            $category['created_at'] = now();
            $category['updated_at'] = now();
        }

        return (int) DB::table('categoria')->insertGetId($category, 'idcategoria');
    }
}
