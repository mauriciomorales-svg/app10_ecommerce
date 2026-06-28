<?php

require dirname(__DIR__) . '/vendor/autoload.php';
$app = require dirname(__DIR__) . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$p = App\Models\Producto::with(['bundleOptions.childProduct'])
    ->whereHas('bundleOptions')
    ->first();

if (! $p) {
    echo "no product with bundle options\n";
    exit(0);
}

$payload = App\Services\ProductBuilderProfileService::builderPayload($p);
$groups = App\Services\ProductBuilderProfileService::formatBundleGroups(
    $p,
    (string) $payload['builder_profile'],
    (bool) $payload['is_combo_product']
);

echo json_encode([
    'product' => $p->nombre,
    'payload' => $payload,
    'first_group' => $groups[0] ?? null,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
