<?php

namespace App\Services;

use App\Models\AdminAuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class AdminAuditService
{
    public static function log(string $action, Model $model, ?array $before = null, ?array $after = null): void
    {
        if (! Schema::hasTable('admin_audit_logs')) {
            return;
        }

        $user = Auth::user();

        AdminAuditLog::query()->create([
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'action' => $action,
            'auditable_type' => $model::class,
            'auditable_id' => (string) $model->getKey(),
            'auditable_label' => self::labelFor($model),
            'changes' => self::buildChanges($before, $after),
            'ip_address' => request()?->ip(),
        ]);
    }

    private static function labelFor(Model $model): ?string
    {
        foreach (['nombre', 'name', 'numero_venta', 'email'] as $key) {
            $value = $model->getAttribute($key);
            if (is_string($value) && $value !== '') {
                return $value;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     * @return array<string, mixed>|null
     */
    private static function buildChanges(?array $before, ?array $after): ?array
    {
        if ($before === null && $after === null) {
            return null;
        }

        return array_filter([
            'before' => $before,
            'after' => $after,
        ], fn ($v) => $v !== null && $v !== []);
    }
}
