<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminRolesSeeder extends Seeder
{
    public function run(): void
    {
        if (! Schema::hasTable('roles')) {
            return;
        }

        $permissions = [
            'manage catalog',
            'view sales',
            'view audit',
            'manage users',
        ];

        foreach ($permissions as $name) {
            Permission::findOrCreate($name, 'web');
        }

        $superAdmin = Role::findOrCreate('super_admin', 'web');
        $superAdmin->syncPermissions($permissions);

        Role::findOrCreate('catalog_manager', 'web')
            ->syncPermissions(['manage catalog']);

        Role::findOrCreate('sales_viewer', 'web')
            ->syncPermissions(['view sales']);

        User::query()->each(function (User $user): void {
            if ($user->roles()->count() === 0) {
                $user->assignRole('super_admin');
            }
        });
    }
}
