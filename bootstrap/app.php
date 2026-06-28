<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->api(append: [
            \App\Http\Middleware\AssignCommerceStore::class,
        ]);
        $middleware->alias([
            'ticket.signed' => \App\Http\Middleware\VerifyOrderTicketSignature::class,
            'legacy.pos.ventas' => \App\Http\Middleware\LegacyPosVentasApiEnabled::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function (\Illuminate\Http\Request $request, \Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->render(function (\Illuminate\Session\TokenMismatchException $e, \Illuminate\Http\Request $request) {
            $path = $request->path();

            if (! str_contains($path, 'admin/productos/') || ! str_contains($path, '/foto')) {
                return null;
            }

            $productoId = $request->route('producto');
            $id = is_object($productoId) ? ($productoId->idproducto ?? null) : $productoId;

            if ($id) {
                return redirect()
                    ->to(\App\Filament\Resources\ProductoResource::getUrl('edit', ['record' => $id]))
                    ->with('dm_photo_session_expired', true);
            }

            return redirect()
                ->to('/admin/productos')
                ->with('dm_photo_session_expired', true);
        });
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('commerce:retry-jobshours-publish')->everyFiveMinutes();
        $schedule->command('commerce:sync-jobshours-status')->everyTenMinutes();
        $schedule->command('commerce:remind-pending-delivery-payment')->hourly();
    })
    ->create();
