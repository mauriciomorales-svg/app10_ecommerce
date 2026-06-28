<?php

use App\Support\CustomizationFieldOptions;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('customization_fields')) {
            return;
        }

        DB::table('customization_fields')
            ->orderBy('id')
            ->lazyById()
            ->each(function ($row): void {
                $raw = json_decode((string) ($row->options ?? ''), true);
                if (! is_array($raw)) {
                    return;
                }

                $normalized = CustomizationFieldOptions::normalizeForStorage($raw);
                if ($normalized === null) {
                    return;
                }

                if (json_encode($raw) === json_encode($normalized)) {
                    return;
                }

                DB::table('customization_fields')
                    ->where('id', $row->id)
                    ->update(['options' => json_encode($normalized)]);
            });
    }

    public function down(): void
    {
        // No revert — formato anterior incompatible con la tienda.
    }
};
