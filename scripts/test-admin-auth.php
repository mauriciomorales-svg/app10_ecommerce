<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Filament\Facades\Filament;

$creds = ['email' => 'admin@admin.com', 'password' => 'admin'];
$ok = Auth::attempt($creds);
echo 'auth_attempt=' . ($ok ? 'ok' : 'fail') . PHP_EOL;

if ($ok) {
    $user = Auth::user();
    $panel = Filament::getPanel('admin');
    echo 'can_access_panel=' . ($user->canAccessPanel($panel) ? 'yes' : 'no') . PHP_EOL;
}

// Test custom login mapping
$login = 'admin';
$email = match (true) {
    $login === 'admin' => 'admin@admin.com',
    str_contains($login, '@') => $login,
    default => $login . '@admin.com',
};
echo 'mapped_email=' . $email . PHP_EOL;
echo 'mapped_auth=' . (Auth::validate(['email' => $email, 'password' => 'admin']) ? 'ok' : 'fail') . PHP_EOL;
