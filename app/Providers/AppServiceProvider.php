<?php

namespace App\Providers;

use App\Models\Producto;
use App\Observers\CategoriaObserver;
use App\Observers\ProductoObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production') || str_starts_with((string) config('app.url'), 'https://')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Producto::observe(ProductoObserver::class);

        if (class_exists(\App\Models\Categoria::class)) {
            \App\Models\Categoria::observe(CategoriaObserver::class);
        }
    }
}
