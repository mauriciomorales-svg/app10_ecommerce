<?php

namespace Database\Seeders;

use App\Services\JobshoursShopCatalogService;
use Illuminate\Database\Seeder;

class JobshoursShopCatalogSeeder extends Seeder
{
    public function run(): void
    {
        app(JobshoursShopCatalogService::class)->install(forceBundles: true);
    }
}
