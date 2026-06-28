<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Filament\Pages\Auth\Login;
use Illuminate\Support\Facades\Auth;

$loginPage = app(Login::class);
$ref = new ReflectionClass($loginPage);

$map = $ref->getMethod('getCredentialsFromFormData');
$map->setAccessible(true);

foreach (['admin', 'admin@admin.com'] as $user) {
    $creds = $map->invoke($loginPage, ['email' => $user, 'password' => 'admin']);
    $ok = Auth::attempt($creds);
    Auth::logout();
    echo 'user=' . $user . ' mapped=' . $creds['email'] . ' attempt=' . ($ok ? 'ok' : 'fail') . PHP_EOL;
}
