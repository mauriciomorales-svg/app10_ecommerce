<?php

require dirname(__DIR__) . '/vendor/autoload.php';
$app = require dirname(__DIR__) . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\AdminAuditLog;
use App\Models\Producto;
use App\Models\User;
use App\Services\BundleConfigurationService;
use App\Services\ProductBuilderProfileService;
use App\Support\AdminAccess;
use App\Support\VentaEstado;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

$fail = 0;
$ok = 0;

function check(string $label, bool $pass, string $detail = ''): void
{
    global $ok, $fail;
    if ($pass) {
        $ok++;
        echo '[OK] ' . $label . ($detail !== '' ? ' — ' . $detail : '') . PHP_EOL;
    } else {
        $fail++;
        echo '[FAIL] ' . $label . ($detail !== '' ? ' — ' . $detail : '') . PHP_EOL;
    }
}

check('VentaEstado pagado', VentaEstado::isPaid('pagado'));
check('VentaEstado legacy activo', VentaEstado::isPaid('activo'));
check('VentaEstado pendiente no cuenta', ! VentaEstado::isPaid('pendiente'));

if (Schema::hasTable('roles')) {
    check('Roles spatie', Role::query()->where('name', 'super_admin')->exists());
    $user = User::query()->first();
    check('AdminAccess panel', $user ? AdminAccess::canAccessPanel($user) : false);
} else {
    echo '[SKIP] roles table' . PHP_EOL;
}

$p = Producto::with(['bundleOptions.childProduct'])->whereHas('bundleOptions')->first();
if ($p) {
    $payload = ProductBuilderProfileService::builderPayload($p);
    check('Builder payload profile', ! empty($payload['builder_profile']));
    check('Builder meta helado_type on arma', ($payload['builder_meta']['helado_type_meta'] ?? []) !== [] || $payload['builder_profile'] !== 'helado_arma');
} else {
    echo '[SKIP] no bundle product' . PHP_EOL;
}

if (Schema::hasTable('admin_audit_logs')) {
    check('Audit table', true);
} else {
    echo '[SKIP] admin_audit_logs' . PHP_EOL;
}

$checkboxProduct = Producto::withoutGlobalScopes(['commerce_store'])
    ->whereHas('bundleOptions', fn ($q) => $q->where('input_type', 'checkbox')->where('is_required', true))
    ->first();

if ($checkboxProduct) {
    $threw = false;
    try {
        BundleConfigurationService::validateForProduct($checkboxProduct, ['modifiers' => []]);
    } catch (ValidationException) {
        $threw = true;
    }
    check('Checkbox required validation', $threw);
} else {
    echo '[SKIP] no required checkbox product' . PHP_EOL;
}

echo PHP_EOL . "Resultado: {$ok} OK, {$fail} FAIL" . PHP_EOL;
exit($fail > 0 ? 1 : 0);
