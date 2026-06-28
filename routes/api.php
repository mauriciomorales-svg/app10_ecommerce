<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CommerceStoreController;
use App\Http\Controllers\Api\HomeExperienceController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\VentaController;
use App\Http\Controllers\Api\FlowController;
use App\Http\Controllers\Api\MercadoPagoOnlineController;
use Illuminate\Http\Request;

Route::get('/user', fn (Request $request) => $request->user())->middleware('auth:sanctum');

Route::get('/commerce/store', [CommerceStoreController::class, 'current']);
Route::get('/commerce/marketing', [\App\Http\Controllers\Api\MarketingConfigController::class, 'show']);

// Productos - usando tabla productos existente
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/productos/suggest', [ProductoController::class, 'suggest']);
Route::get('/productos/destacados', [ProductoController::class, 'destacados']);
Route::get('/productos/categorias', [ProductoController::class, 'categorias']);
Route::get('/tienda/experiencias-home', [HomeExperienceController::class, 'index']);
Route::get('/tienda/helados/toppis-del-dia', [\App\Http\Controllers\Api\HeladosToppisDelDiaController::class, 'show']);
Route::get('/productos/{id}', [ProductoController::class, 'show']);
Route::get('/productos/{id}/imagen', [ProductoController::class, 'imagen']);

// Ventas legacy POS (deshabilitado por defecto; ver COMMERCE_LEGACY_POS_VENTAS_API)
Route::post('/ventas', [VentaController::class, 'store'])->middleware('legacy.pos.ventas');

// Pagos - Flow
Route::middleware('throttle:30,1')->group(function () {
    Route::post('/pagos/flow', [FlowController::class, 'iniciar']);
    Route::post('/pagos/mp-online', [MercadoPagoOnlineController::class, 'iniciar']);
    Route::post('/checkout/preview', [\App\Http\Controllers\Api\CheckoutOptionsController::class, 'preview']);
});

// Pagos - Flow (confirm/return sin throttle estricto — callback Flow)
Route::get('/pagos/flow/confirm', [FlowController::class, 'confirm']);
Route::post('/pagos/flow/confirm', [FlowController::class, 'confirm']);
Route::match(['get', 'post'], '/pagos/flow/return', [FlowController::class, 'retorno']);

// Estado de proveedores de pago (feature flags + configuración base)
Route::get('/pagos/providers', function () {
    $flowApiKey = trim((string) config('services.flow.api_key', ''));
    $flowSecret = trim((string) config('services.flow.secret_key', ''));
    $mpToken = trim((string) (config('services.mercadopago.access_token', '') ?: ''));

    return response()->json([
        'success' => true,
        'providers' => [
            'flow' => [
                'enabled' => (bool) config('payments.providers.flow.enabled', true),
                'configured' => $flowApiKey !== '' && $flowSecret !== '',
            ],
            'mp_online' => [
                'enabled' => (bool) config('payments.providers.mp_online.enabled', true),
                'configured' => $mpToken !== '',
            ],
        ],
    ]);
});

// Pagos - Mercado Pago Online (Checkout Preferences)
Route::get('/pagos/mp-online/status', [MercadoPagoOnlineController::class, 'status']);
Route::post('/pagos/mp-online/webhook', [MercadoPagoOnlineController::class, 'webhook']);

// Checkout: empaque, retiro, envío
Route::get('/checkout/options', [\App\Http\Controllers\Api\CheckoutOptionsController::class, 'index']);
Route::middleware('throttle:30,1')->group(function () {
    Route::post('/checkout/cart-suggestions', [\App\Http\Controllers\Api\CartSuggestionController::class, 'index']);
    Route::post('/commerce/events', [\App\Http\Controllers\Api\CommerceEventController::class, 'store']);
});

Route::middleware('throttle:60,1')->group(function () {
    Route::get('/commerce/visits/stats', [\App\Http\Controllers\Api\CommerceVisitStatsController::class, 'index']);
});

Route::middleware('throttle:15,1')->group(function () {
    Route::post('/checkout/coupon/validate', [\App\Http\Controllers\Api\CouponController::class, 'validate']);
});
Route::get('/checkout/delivery-config', [\App\Http\Controllers\Api\DeliveryCheckoutController::class, 'config']);
Route::get('/checkout/delivery-quote', [\App\Http\Controllers\Api\DeliveryCheckoutController::class, 'quote']);
Route::middleware('throttle:20,1')->group(function () {
    Route::post('/checkout/geocode', [\App\Http\Controllers\Api\DeliveryCheckoutController::class, 'geocode']);
});

// Ticket de orden (comanda) — enlace firmado (APP_KEY)
Route::get('/ordenes/{id}/ticket', [\App\Http\Controllers\Api\OrderTicketController::class, 'show'])
    ->middleware('ticket.signed');

// Seguimiento de pedido (cliente, sin login)
Route::get('/ordenes/{id}/seguimiento', [\App\Http\Controllers\Api\OrderTrackingController::class, 'show'])
    ->middleware('ticket.signed');

// Sugerencias de productos (completa tu regalo)
Route::get('/productos/{id}/sugerencias', [\App\Http\Controllers\Api\ProductSuggestionController::class, 'index']);
