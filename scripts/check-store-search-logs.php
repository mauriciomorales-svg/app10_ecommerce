<?php

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\StoreSearchLog;
use Illuminate\Support\Facades\Schema;

if (! Schema::hasTable('store_search_logs')) {
    echo "NO_TABLE\n";
    exit(1);
}

echo 'count='.StoreSearchLog::count()."\n";
foreach (StoreSearchLog::orderByDesc('id')->limit(8)->get() as $r) {
    echo "{$r->created_at} | {$r->query} | {$r->scope} | {$r->outcome} | total={$r->total_results}\n";
}
