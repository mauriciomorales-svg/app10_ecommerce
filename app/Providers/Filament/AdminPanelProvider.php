<?php

namespace App\Providers\Filament;

use App\Filament\Pages\Auth\Login;
use App\Filament\Pages\Dashboard;
use App\Filament\Pages\ManageProductSuggestions;
use App\Filament\Pages\RegalosKpisPage;
use Filament\FontProviders\GoogleFontProvider;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationGroup;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Support\Enums\Width;
use Filament\View\PanelsRenderHook;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login(Login::class)
            ->profile(isSimple: false)
            ->brandName('DondeMorales')
            ->brandLogoHeight('2.25rem')
            ->favicon('/favicon.svg')
            ->colors([
                'primary' => Color::hex('#0d9488'),
                'gray' => Color::Slate,
                'success' => Color::Emerald,
                'warning' => Color::Amber,
                'danger' => Color::Rose,
                'info' => Color::Sky,
            ])
            ->font('Plus Jakarta Sans', provider: GoogleFontProvider::class)
            ->sidebarCollapsibleOnDesktop()
            ->sidebarFullyCollapsibleOnDesktop()
            ->maxContentWidth(Width::Full)
            ->navigationGroups([
                NavigationGroup::make('Tienda')
                    ->icon('heroicon-o-building-storefront'),
                NavigationGroup::make('Catálogo')
                    ->icon('heroicon-o-shopping-bag'),
                NavigationGroup::make('Ventas')
                    ->icon('heroicon-o-chart-bar-square'),
                NavigationGroup::make('Marketing')
                    ->icon('heroicon-o-megaphone'),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->pages([
                Dashboard::class,
                ManageProductSuggestions::class,
                RegalosKpisPage::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->routes(function (): void {
                Route::post('/productos/{producto:idproducto}/foto', [\App\Http\Controllers\Admin\ProductPhotoUploadController::class, 'store'])
                    ->name('productos.upload-foto');
                Route::post('/productos/{producto:idproducto}/foto/desde-url', [\App\Http\Controllers\Admin\ProductPhotoUploadController::class, 'storeFromUrl'])
                    ->name('productos.upload-foto-url');
                Route::post('/productos/{producto:idproducto}/foto/eliminar', [\App\Http\Controllers\Admin\ProductPhotoUploadController::class, 'destroy'])
                    ->name('productos.delete-foto');
                Route::post('/productos/{producto:idproducto}/foto/referencia-temp', [\App\Http\Controllers\Admin\ProductPhotoUploadController::class, 'storeReference'])
                    ->name('productos.photo-reference-temp');
                Route::get('/productos/{producto:idproducto}/foto/sugerencias', [\App\Http\Controllers\Admin\ProductPhotoUploadController::class, 'suggestions'])
                    ->name('productos.photo-suggestions');
            })
            ->renderHook(PanelsRenderHook::STYLES_AFTER, function (): string {
                $path = public_path('css/dm-admin.css');

                if (! File::exists($path)) {
                    return '';
                }

                return Blade::render('<style>{!! $css !!}</style>', [
                    'css' => File::get($path),
                ]);
            })
            ->renderHook(PanelsRenderHook::SCRIPTS_AFTER, function (): string {
                $path = public_path('js/dm-product-photo.js');

                if (! File::exists($path)) {
                    return '';
                }

                return '<script>' . File::get($path) . '</script>';
            })
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
