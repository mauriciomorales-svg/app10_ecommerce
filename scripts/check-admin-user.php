<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$u = User::where('email', 'admin@admin.com')->first();
if (! $u) {
    echo "user_missing\n";
    exit(1);
}

echo 'email=' . $u->email . "\n";
echo 'name=' . $u->name . "\n";
echo 'password_check=' . (Hash::check('admin', $u->password) ? 'ok' : 'fail') . "\n";
