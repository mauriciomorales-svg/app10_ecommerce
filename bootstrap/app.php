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
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('commerce:retry-jobshours-publish')->everyFiveMinutes();
        $schedule->command('commerce:sync-jobshours-status')->everyTenMinutes();
        $schedule->command('commerce:remind-pending-delivery-payment')->hourly();
    })
    ->create();
