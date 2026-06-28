<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::updateOrCreate(
    ['email' => 'admin@admin.com'],
    [
        'name' => 'admin',
        'password' => 'admin',
        'email_verified_at' => now(),
    ]
);

echo 'reset_ok email=' . $user->email . ' verify=' . (Hash::check('admin', $user->password) ? 'ok' : 'fail') . PHP_EOL;
