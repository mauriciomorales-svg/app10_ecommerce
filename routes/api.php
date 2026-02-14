<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\VentaController;
use App\Http\Controllers\Api\FlowController;
use Illuminate\Http\Request;

Route::get('/user', fn (Request $request) => $request->user())->middleware('auth:sanctum');

// Productos - usando tabla productos existente
Route::get('/productos', [ProductoController::class, 'index']);
Route::get('/productos/destacados', [ProductoController::class, 'destacados']);
Route::get('/productos/categorias', [ProductoController::class, 'categorias']);
Route::get('/productos/{id}', [ProductoController::class, 'show']);
Route::get('/productos/{id}/imagen', [ProductoController::class, 'imagen']);

// Ventas - usando tabla venta y detalle_venta existentes
Route::post('/ventas', [VentaController::class, 'store']);

// Pagos - Flow
Route::post('/pagos/flow', [FlowController::class, 'iniciar']);
Route::get('/pagos/flow/confirm', [FlowController::class, 'confirm']);
Route::post('/pagos/flow/confirm', [FlowController::class, 'confirm']);
Route::match(['get', 'post'], '/pagos/flow/return', [FlowController::class, 'retorno']);

// Ticket de orden (comanda para empaque)
Route::get('/ordenes/{id}/ticket', [\App\Http\Controllers\Api\OrderTicketController::class, 'show']);

// Sugerencias de productos (completa tu regalo)
Route::get('/productos/{id}/sugerencias', [\App\Http\Controllers\Api\ProductSuggestionController::class, 'index']);
