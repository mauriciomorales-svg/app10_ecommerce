<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Filament\Pages\Auth\Login;
use Illuminate\Support\Facades\Auth;
use Livewire\Livewire;

foreach (['admin', 'admin@admin.com'] as $user) {
    Auth::logout();

    try {
        Livewire::test(Login::class)
            ->fillForm([
                'email' => $user,
                'password' => 'admin',
            ])
            ->call('authenticate');

        $loggedIn = Auth::check();
        echo 'user=' . $user . ' auth=' . ($loggedIn ? 'ok' : 'fail') . PHP_EOL;
    } catch (Throwable $e) {
        echo 'user=' . $user . ' err=' . $e->getMessage() . PHP_EOL;
    }
}
