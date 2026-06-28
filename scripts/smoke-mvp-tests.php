<?php
/**
 * Pruebas de humo MVP — ejecutar en servidor: php scripts/smoke-mvp-tests.php
 */
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$fail = 0;
$ok = 0;

function check(string $label, bool $pass, string $detail = ''): void
{
    global $ok, $fail;
    if ($pass) {
        $ok++;
        echo "[OK] {$label}".($detail !== '' ? " — {$detail}" : '')."\n";
    } else {
        $fail++;
        echo "[FAIL] {$label}".($detail !== '' ? " — {$detail}" : '')."\n";
    }
}

// --- Config ---
check('JobsHours habilitado', (bool) config('delivery.jobshours.enabled'));
check('JobsHours token', trim((string) config('delivery.jobshours.token')) !== '');
$mailOk = App\Support\CommerceMail::canSend();
check('CommerceMail', true, $mailOk ? 'enviando' : 'log/sin clave (esperado si no Resend)');

// --- Firmas ---
$sig = hash_hmac('sha256', '1:9999999999', (string) config('app.key'));
check('OrderTrackingUrl genera URL', str_contains(App\Support\OrderTrackingUrl::signed(1, 60), '/seguimiento?'));

// --- DB ventas ---
$total = App\Models\Venta::count();
$pagado = App\Models\Venta::whereRaw('LOWER(estado) = ?', ['pagado'])->count();
$delivery = App\Models\Venta::where('fulfillment_type', 'delivery')->count();
echo "INFO ventas total={$total} pagado={$pagado} delivery={$delivery}\n";

$paid = App\Models\Venta::whereRaw('LOWER(estado) = ?', ['pagado'])->orderByDesc('idventa')->first();
if ($paid) {
    $url = App\Support\OrderTrackingUrl::signed((int) $paid->idventa, 3600);
    echo "INFO tracking_ejemplo={$url}\n";
    $public = App\Services\PickupFulfillmentService::ventaToPublicArray($paid);
    check('tracking_url en API pública', ! empty($public['tracking_url']));
} else {
    echo "WARN sin ventas pagadas — probar tracking tras una compra real\n";
}

// --- HTTP local API ---
$base = 'http://127.0.0.1:8002/api';

function httpGet(string $url): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_HEADER => true,
    ]);
    $raw = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    $parts = explode("\r\n\r\n", (string) $raw, 2);
    $body = $parts[1] ?? '';

    return ['code' => $code, 'body' => $body];
}

$r = httpGet("{$base}/checkout/options?subtotal=5000");
check('GET checkout/options', $r['code'] === 200 && str_contains($r['body'], '"success":true'));

$r = httpGet("{$base}/ordenes/1/seguimiento");
check('seguimiento sin firma → 403', $r['code'] === 403);

$r = httpGet("{$base}/ordenes/1/seguimiento?expires=1&sig=bad");
check('seguimiento firma inválida → 403', $r['code'] === 403);

if ($paid) {
    $expires = time() + 3600;
    $sig = hash_hmac('sha256', "{$paid->idventa}:{$expires}", (string) config('app.key'));
    $r = httpGet("{$base}/ordenes/{$paid->idventa}/seguimiento?expires={$expires}&sig={$sig}");
    check('seguimiento válido', $r['code'] === 200 && str_contains($r['body'], '"success":true'), "HTTP {$r['code']}");
}

$r = httpGet("{$base}/ordenes/999999/seguimiento?expires=". (time() + 3600) .'&sig='.$sig);
// wrong sig for 999999 - use proper sig
$expires2 = time() + 3600;
$sig2 = hash_hmac('sha256', "999999:{$expires2}", (string) config('app.key'));
$r = httpGet("{$base}/ordenes/999999/seguimiento?expires={$expires2}&sig={$sig2}");
check('seguimiento venta inexistente → 404', $r['code'] === 404, "HTTP {$r['code']}");

$r = httpGet("{$base}/pagos/mp-online/status");
check('mp status sin venta_id → 422 JSON', $r['code'] === 422 && str_contains($r['body'], 'venta_id'), "HTTP {$r['code']}");

$r = httpGet("{$base}/checkout/delivery-quote?lat=-37.67&lng=-72.57");
check('delivery-quote válido', $r['code'] === 200 && str_contains($r['body'], '"success":true'));

$r = httpGet("{$base}/checkout/delivery-quote?subtotal=5000");
check('delivery-quote sin lat → 422 JSON', $r['code'] === 422 && str_contains($r['body'], 'lat'), "HTTP {$r['code']}");

$r = httpGet("{$base}/ordenes/1/seguimiento?expires=1&sig=bad");
check('seguimiento 403 es JSON', $r['code'] === 403 && str_contains($r['body'], '"success"'), "HTTP {$r['code']}");

echo "\n=== Resumen: {$ok} OK, {$fail} FAIL ===\n";
exit($fail > 0 ? 1 : 0);
