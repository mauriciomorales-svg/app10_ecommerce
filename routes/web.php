<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use App\Models\Producto;
use App\Models\Categoria;

// Tienda con productos dinámicos
Route::get('/', function () {
    if (! Schema::hasTable('productos')) {
        return response(
            '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Tienda</title></head><body><p>Catálogo no configurado.</p></body></html>',
            200,
            ['Content-Type' => 'text/html; charset=UTF-8']
        );
    }

    $query = Producto::with('categoria');

    // Búsqueda por nombre (portable: ilike solo existe en PostgreSQL)
    if (request('buscar')) {
        $term = '%'.strtolower((string) request('buscar')).'%';
        $query->whereRaw('LOWER(nombre) LIKE ?', [$term]);
    }
    
    // Filtro por categoría
    if (request('categoria')) {
        $query->where('idcategoria', request('categoria'));
    }
    
    // Ordenamiento
    $orden = request('orden', 'nuevos');
    switch ($orden) {
        case 'precio_menor':
            $query->orderBy('precio', 'asc');
            break;
        case 'precio_mayor':
            $query->orderBy('precio', 'desc');
            break;
        case 'nombre':
            $query->orderBy('nombre', 'asc');
            break;
        default:
            $query->orderBy('idproducto', 'desc');
    }
    
    $productos = $query->paginate(12);
    $categorias = Schema::hasTable('categoria')
        ? Categoria::orderBy('nombre')->get()
        : collect();
    
    return view('tienda.home', compact('productos', 'categorias'));
});

// Ruta para el carrito (Next.js)
Route::get('/carrito', function () {
    return file_get_contents(public_path('carrito.html'));
});

// Archivos estáticos - excluir api para que funcione api.php
Route::get('/{any}', function ($any) {
    $path = public_path($any);
    if (file_exists($path) && is_file($path)) {
        return file_get_contents($path);
    }
    return redirect('/');
})->where('any', '^(?!api).*$');
