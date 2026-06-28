<?php
/**
 * Pruebas de humo CRUD admin (Filament + fotos).
 * Uso: php scripts/test-admin-crud-smoke.php
 */
putenv('CACHE_STORE=array');
putenv('SESSION_DRIVER=array');
putenv('QUEUE_CONNECTION=sync');
$_ENV['CACHE_STORE'] = 'array';
$_ENV['SESSION_DRIVER'] = 'array';
$_ENV['QUEUE_CONNECTION'] = 'sync';

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Filament\Resources\CategoriaResource;
use App\Filament\Resources\ProductoResource;
use App\Filament\Resources\ValeDescuentoResource;
use App\Filament\Resources\VentaResource;
use App\Http\Controllers\Admin\ProductPhotoUploadController;
use App\Models\Categoria;
use App\Models\Producto;
use App\Models\User;
use App\Models\ValeDescuento;
use App\Models\Venta;
use App\Services\ProductImageSuggestionService;
use App\Services\ProductPhotoSyncService;
use Filament\Facades\Filament;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

$fail = 0;
$ok = 0;
$cleanedUp = false;
$createdProductId = null;
$createdCategoriaId = null;
$createdValeId = null;
$testBarcode = 'TEST_CRUD_' . time();

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

function cleanup(): void
{
    global $createdProductId, $createdCategoriaId, $createdValeId, $testBarcode, $cleanedUp;

    if ($cleanedUp) {
        return;
    }
    $cleanedUp = true;

    if ($createdProductId) {
        $p = Producto::withoutGlobalScopes(['commerce_store'])->find($createdProductId);
        if ($p) {
            app(ProductPhotoSyncService::class)->deletePhotosForProduct($p);
            $p->delete();
        }
    }

    foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
        @unlink(public_path("fotos_productos/{$testBarcode}.{$ext}"));
    }

    try {
        Storage::disk('local')->deleteDirectory('temp-product-photos');
    } catch (\Throwable) {
        // Windows puede fallar si un archivo temporal ya fue borrado.
    }

    if ($createdCategoriaId) {
        Categoria::query()->where('idcategoria', $createdCategoriaId)->delete();
    }

    if ($createdValeId) {
        ValeDescuento::query()->where('idvale', $createdValeId)->delete();
    }
}

register_shutdown_function('cleanup');

echo '=== Admin CRUD smoke ' . date('c') . ' ===' . PHP_EOL;

// --- Auth ---
$user = User::query()->where('email', 'admin@admin.com')->first()
    ?? User::query()->first();

check('Usuario admin existe', $user !== null, $user?->email ?? 'ninguno');

if ($user) {
    check('Auth attempt admin/admin', Auth::attempt(['email' => $user->email, 'password' => 'admin']));
    $panel = Filament::getPanel('admin');
    check('canAccessPanel', Auth::user()?->canAccessPanel($panel) ?? false);
}

// --- Rutas registradas ---
$routeNames = [
    'filament.admin.resources.productos.index',
    'filament.admin.resources.productos.create',
    'filament.admin.productos.upload-foto',
    'filament.admin.productos.delete-foto',
    'filament.admin.productos.upload-foto-url',
    'filament.admin.productos.photo-suggestions',
    'filament.admin.productos.photo-reference-temp',
];

foreach ($routeNames as $name) {
    check("Ruta {$name}", Route::has($name));
}

// --- Resources boot ---
foreach ([ProductoResource::class, VentaResource::class] as $resource) {
    check('Resource ' . class_basename($resource), class_exists($resource));
}

if (Schema::hasTable('categoria')) {
    check('CategoriaResource accesible', CategoriaResource::canAccess());
}

if (Schema::hasTable('vale_descuento')) {
    check('ValeDescuentoResource accesible', ValeDescuentoResource::canAccess());
}

// --- HTTP admin (autenticado) ---
if ($user) {
    Auth::login($user);
    $kernel = app(Illuminate\Contracts\Http\Kernel::class);

    $pages = [
        'GET /admin/productos' => '/admin/productos',
        'GET /admin/productos/create' => '/admin/productos/create',
    ];

    if (Schema::hasTable('categoria')) {
        $pages['GET /admin/categorias'] = '/admin/categorias';
    }
    if (Schema::hasTable('vale_descuento')) {
        $pages['GET /admin/vale-descuentos'] = '/admin/vale-descuentos';
    }
    $pages['GET /admin/ventas'] = '/admin/ventas';

    foreach ($pages as $label => $uri) {
        $req = Request::create($uri, 'GET');
        $req->setLaravelSession(app('session.store'));
        $req->session()->start();
        $req->session()->put('_token', csrf_token());
        Auth::login($user);

        $res = $kernel->handle($req);
        $kernel->terminate($req, $res);

        check($label, $res->getStatusCode() === 200, 'HTTP ' . $res->getStatusCode());
    }
}

// --- CRUD Producto ---
$producto = Producto::withoutGlobalScopes(['commerce_store'])->create([
    'nombre' => 'Producto prueba CRUD ' . time(),
    'codigobarra' => $testBarcode,
    'descripcion' => 'Auto-test',
    'precio' => 999,
    'precio_costo' => 500,
    'stock_actual' => 1,
    'stock_minimo' => 1,
    'alerta_stock_minimo' => 1,
    'activo' => false,
]);
$createdProductId = $producto->idproducto;
check('Producto CREATE', $producto->exists, 'id=' . $createdProductId);

$producto->update(['nombre' => 'Producto prueba CRUD actualizado']);
$producto->refresh();
check('Producto UPDATE', str_contains($producto->nombre, 'actualizado'));

// --- Foto: publicar y eliminar ---
$png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
Storage::disk('local')->makeDirectory('temp-product-photos');
$tempRel = 'temp-product-photos/crud_test_' . time() . '.png';
Storage::disk('local')->put($tempRel, $png);

$photoOk = app(ProductPhotoSyncService::class)->publishFromFilamentPath($producto->fresh(), $tempRel);
check('Foto PUBLICAR', $photoOk);

$preview = ProductoResource::productImagePreviewUrl($producto->fresh());
check('Foto PREVIEW URL', $preview !== null, (string) $preview);

$delOk = app(ProductPhotoSyncService::class)->deletePhotosForProduct($producto->fresh());
check('Foto ELIMINAR', $delOk || ProductoResource::productImagePreviewUrl($producto->fresh()) === null);

// --- Sugerencias ---
$suggestionService = app(ProductImageSuggestionService::class);
$visualItems = $suggestionService->searchForProduct($producto, null, 'visual', 3);
$nameItems = $suggestionService->searchForProduct($producto, null, 'name', 3);
check('Sugerencias visual (Serper)', is_array($visualItems), 'count=' . count($visualItems));
check('Sugerencias nombre (Serper)', is_array($nameItems), 'count=' . count($nameItems));
check('Google Lens URL', $suggestionService->googleLensUrl($preview) !== null || $preview === null);

// --- HTTP foto endpoints (autenticado) ---
if ($user) {
    Auth::login($user);
    $controller = app(ProductPhotoUploadController::class);

    $sugReq = Request::create(
        '/admin/productos/' . $producto->idproducto . '/foto/sugerencias?mode=visual',
        'GET'
    );
    $sugReq->setUserResolver(fn () => $user);
    $sugRes = $controller->suggestions($sugReq, $producto->fresh());
    $sugJson = json_decode($sugRes->getContent(), true);
    check('HTTP GET sugerencias', $sugRes->getStatusCode() === 200 && is_array($sugJson['items'] ?? null));

    $uploadAbs = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'dm_crud_upload_' . time() . '.png';
    file_put_contents($uploadAbs, $png);
    $uploadReq = Request::create('/admin/productos/' . $producto->idproducto . '/foto', 'POST', [
        '_token' => csrf_token(),
    ], [], [
        'foto' => new UploadedFile(
            $uploadAbs,
            'crud.png',
            'image/png',
            null,
            true
        ),
    ]);
    $uploadReq->setUserResolver(fn () => $user);
    $uploadRes = $controller->store($uploadReq, $producto->fresh());
    check('HTTP POST subir foto', $uploadRes->getStatusCode() === 302, 'redirect');

    $destroyReq = Request::create('/admin/productos/' . $producto->idproducto . '/foto/eliminar', 'POST', [
        '_token' => csrf_token(),
    ]);
    $destroyReq->setUserResolver(fn () => $user);
    $destroyRes = $controller->destroy($producto->fresh());
    check('HTTP POST eliminar foto', $destroyRes->getStatusCode() === 302, 'redirect');

    $editReq = Request::create('/admin/productos/' . $producto->idproducto . '/edit', 'GET');
    $editReq->setLaravelSession(app('session.store'));
    $editReq->session()->start();
    Auth::login($user);
    $editRes = $kernel->handle($editReq);
    $kernel->terminate($editReq, $editRes);
    check('GET edit producto', $editRes->getStatusCode() === 200, 'HTTP ' . $editRes->getStatusCode());
}

// --- CRUD Categoría ---
if (Schema::hasTable('categoria')) {
    $cat = Categoria::query()->create([
        'nombre' => 'Cat CRUD ' . time(),
        'descripcion' => 'test',
        'activo' => true,
    ]);
    $createdCategoriaId = $cat->idcategoria;
    check('Categoria CREATE', $cat->exists, 'id=' . $createdCategoriaId);

    $cat->update(['nombre' => 'Cat CRUD actualizada']);
    check('Categoria UPDATE', str_contains($cat->fresh()->nombre, 'actualizada'));

    $catDeleteId = $createdCategoriaId;
    $createdCategoriaId = null;
    check('Categoria DELETE', Categoria::query()->where('idcategoria', $catDeleteId)->delete() === 1);
}

// --- CRUD Cupón ---
if (Schema::hasTable('vale_descuento')) {
    $codigo = 'CRUD' . strtoupper(substr(md5((string) time()), 0, 6));
    $vale = ValeDescuento::query()->create([
        'codigo' => $codigo,
        'tipo' => 'PORCENTAJE',
        'valor' => 5,
        'descripcion' => 'Test CRUD',
        'monto_minimo' => 0,
        'activo' => false,
        'solo_primera_compra' => false,
    ]);
    $createdValeId = $vale->idvale;
    check('Cupón CREATE', $vale->exists, 'codigo=' . $codigo);

    $vale->update(['valor' => 10]);
    check('Cupón UPDATE', (float) $vale->fresh()->valor === 10.0);

    $valeDeleteId = $createdValeId;
    $createdValeId = null;
    check('Cupón DELETE', ValeDescuento::query()->where('idvale', $valeDeleteId)->delete() === 1);
}

// --- Ventas (lectura) ---
if (Schema::hasTable('venta')) {
    $ventaCount = Venta::query()->count();
    check('Ventas READ list', $ventaCount >= 0, "total={$ventaCount}");

    $sample = Venta::query()->orderByDesc('idventa')->first();
    if ($sample) {
        check('Venta sample existe', true, 'idventa=' . $sample->idventa);
    }
}

// --- Producto DELETE ---
$idToDelete = $createdProductId;
$createdProductId = null;
$deleted = Producto::withoutGlobalScopes(['commerce_store'])->where('idproducto', $idToDelete)->delete();
check('Producto DELETE', $deleted === 1, 'id=' . $idToDelete);

echo PHP_EOL . "=== Resultado: {$ok} OK, {$fail} FAIL ===" . PHP_EOL;
cleanup();
exit($fail > 0 ? 1 : 0);
