<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Schema;

class AdminAccess
{
    public static function rolesEnabled(): bool
    {
        return Schema::hasTable('roles');
    }

    public static function canAccessPanel(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        if (! self::rolesEnabled()) {
            return true;
        }

        if ($user->hasAnyRole(['super_admin', 'catalog_manager', 'sales_viewer'])) {
            return true;
        }

        return $user->roles()->count() === 0;
    }

    public static function canManageCatalog(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        if (! self::rolesEnabled() || $user->roles()->count() === 0) {
            return true;
        }

        return $user->hasAnyRole(['super_admin', 'catalog_manager']);
    }

    public static function canViewSales(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        if (! self::rolesEnabled() || $user->roles()->count() === 0) {
            return true;
        }

        return $user->hasAnyRole(['super_admin', 'sales_viewer']);
    }

    public static function canViewAudit(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        if (! self::rolesEnabled() || $user->roles()->count() === 0) {
            return true;
        }

        return $user->hasRole('super_admin');
    }
}
