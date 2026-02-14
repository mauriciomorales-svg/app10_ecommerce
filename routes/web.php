<?php

use Illuminate\Support\Facades\Route;
use App\Models\Producto;
use App\Models\Categoria;

// Tienda con productos dinámicos
Route::get('/', function () {
    $query = Producto::with('categoria');
    
    // Búsqueda por nombre
    if (request('buscar')) {
        $query->where('nombre', 'ilike', '%' . request('buscar') . '%');
    }
    
    // Filtro por categoría
    if (request('categoria')) {
        $query->where('idcategoria', request('categoria'));
    }
    
    // Ordenamiento
    $orden = request('orden', 'nuevos');
    switch ($orden) {
        case 'precio_menor':
            $query->orderBy('precio_venta', 'asc');
            break;
        case 'precio_mayor':
            $query->orderBy('precio_venta', 'desc');
            break;
        case 'nombre':
            $query->orderBy('nombre', 'asc');
            break;
        default:
            $query->orderBy('idproducto', 'desc');
    }
    
    $productos = $query->paginate(12);
    $categorias = Categoria::orderBy('nombre')->get();
    
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
