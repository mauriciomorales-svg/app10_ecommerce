<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DondeMorales - Tienda Online</title>
    <meta name="description" content="Tu minimarket de confianza en Renaico - Más de 1,900 productos disponibles">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
</head>
<body class="bg-slate-50">
    <!-- Navbar -->
    <nav class="bg-white shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <a href="/" class="flex items-center space-x-2">
                    <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                    </svg>
                    <span class="text-xl font-bold text-gray-900">Donde<span class="text-blue-600">Morales</span></span>
                </a>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="/" class="text-gray-700 hover:text-blue-600 font-medium">Inicio</a>
                    <a href="/carrito" class="relative text-gray-700 hover:text-blue-600 flex items-center space-x-1">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                        <span>Carrito</span>
                        <span id="cart-count" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center hidden">0</span>
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <div class="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="text-center">
                <h1 class="text-4xl md:text-5xl font-extrabold mb-4">Donde<span class="text-yellow-300">Morales</span></h1>
                <p class="text-xl text-blue-100 mb-6">Tu minimarket de confianza en Renaico</p>
                
                <!-- Search Bar -->
                <form action="/" method="GET" class="max-w-2xl mx-auto mb-8" id="search-form">
                    <div class="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
                        <svg class="h-5 w-5 text-gray-400 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input type="text" name="buscar" id="buscar" placeholder="Buscar entre 1,900 productos..." 
                               value="{{ request('buscar') }}"
                               class="flex-1 px-4 py-3 text-gray-800 outline-none text-lg">
                        <button type="submit" class="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 font-medium">Buscar</button>
                    </div>
                </form>

                <!-- Features -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div class="flex items-center justify-center space-x-2 bg-white/10 rounded-lg p-3">
                        <svg class="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                        <span>Retiro en tienda - Santiago Watt 205</span>
                    </div>
                    <div class="flex items-center justify-center space-x-2 bg-white/10 rounded-lg p-3">
                        <svg class="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Lun-Dom: 9:00 - 21:00</span>
                    </div>
                    <div class="flex items-center justify-center space-x-2 bg-white/10 rounded-lg p-3">
                        <svg class="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                        </svg>
                        <span>Pagos con WebPay</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content with Sidebar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
            
            <!-- Sidebar Filters -->
            <aside class="lg:w-64 flex-shrink-0">
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-20">
                    <h3 class="font-bold text-gray-900 mb-4 flex items-center">
                        <svg class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                        </svg>
                        Filtros
                    </h3>

                    <!-- Categorías -->
                    <div class="mb-6">
                        <h4 class="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Categorías</h4>
                        <div class="space-y-2 max-h-64 overflow-y-auto">
                            <a href="/" class="block px-3 py-2 rounded-lg {{ !request('categoria') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100' }} transition-colors text-sm">
                                Todas las categorías
                            </a>
                            @foreach($categorias as $cat)
                            <a href="/?categoria={{ $cat->idcategoria }}" 
                               class="block px-3 py-2 rounded-lg {{ request('categoria') == $cat->idcategoria ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100' }} transition-colors text-sm">
                                {{ $cat->nombre }}
                            </a>
                            @endforeach
                        </div>
                    </div>

                    <!-- Ordenar -->
                    <div class="mb-6">
                        <h4 class="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Ordenar por</h4>
                        <form action="/" method="GET" id="orden-form">
                            @if(request('buscar'))
                                <input type="hidden" name="buscar" value="{{ request('buscar') }}">
                            @endif
                            @if(request('categoria'))
                                <input type="hidden" name="categoria" value="{{ request('categoria') }}">
                            @endif
                            <select name="orden" onchange="this.form.submit()" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                                <option value="nuevos" {{ request('orden') == 'nuevos' ? 'selected' : '' }}>Más nuevos</option>
                                <option value="precio_menor" {{ request('orden') == 'precio_menor' ? 'selected' : '' }}>Precio: menor a mayor</option>
                                <option value="precio_mayor" {{ request('orden') == 'precio_mayor' ? 'selected' : '' }}>Precio: mayor a menor</option>
                                <option value="nombre" {{ request('orden') == 'nombre' ? 'selected' : '' }}>Nombre A-Z</option>
                            </select>
                        </form>
                    </div>

                    <!-- Limpiar filtros -->
                    @if(request('buscar') || request('categoria') || request('orden'))
                    <a href="/" class="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm">
                        Limpiar filtros
                    </a>
                    @endif
                </div>
            </aside>

            <!-- Products Grid -->
            <main class="flex-1">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">
                            @if(request('buscar'))
                                Resultados para "{{ request('buscar') }}"
                            @elseif(request('categoria'))
                                {{ $categorias->firstWhere('idcategoria', request('categoria'))?->nombre ?? 'Productos' }}
                            @else
                                Todos los productos
                            @endif
                        </h2>
                        <p class="text-gray-600 mt-1">{{ $productos->total() }} productos encontrados</p>
                    </div>
                </div>

                @if($productos->isEmpty())
                    <div class="text-center py-16 bg-white rounded-xl shadow-sm">
                        <svg class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                        </svg>
                        <p class="text-gray-500 text-lg">No se encontraron productos</p>
                        <a href="/" class="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium">Ver todos los productos</a>
                    </div>
                @else
                    <!-- Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        @foreach($productos as $producto)
                        <div class="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                            <!-- Image -->
                            <div class="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                                @if($producto->imagen)
                                    <img src="{{ $producto->imagen }}" alt="{{ $producto->nombre }}" 
                                         class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300">
                                @else
                                    <div class="h-full w-full flex items-center justify-center">
                                        <div class="bg-white rounded-full p-4 shadow-sm">
                                            <svg class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                                            </svg>
                                        </div>
                                    </div>
                                @endif
                                
                                @if($producto->stock <= 5 && $producto->stock > 0)
                                    <span class="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">¡Últimos {{ $producto->stock }}!</span>
                                @elseif($producto->stock == 0)
                                    <span class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">Agotado</span>
                                @endif
                            </div>
                            
                            <!-- Info -->
                            <div class="p-4">
                                <p class="text-xs text-blue-600 font-medium uppercase mb-1">{{ $producto->categoria?->nombre ?? 'Sin categoría' }}</p>
                                <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">{{ $producto->nombre }}</h3>
                                <p class="text-xs text-gray-500 mb-3">Código: {{ $producto->idproducto }}</p>
                                
                                <div class="flex items-center justify-between mb-3">
                                    <p class="text-xl font-bold text-gray-900">${{ number_format($producto->precio_venta, 0, ',', '.') }}</p>
                                    <p class="text-sm {{ $producto->stock > 0 ? 'text-green-600' : 'text-red-500' }}">
                                        {{ $producto->stock > 0 ? 'Stock: '.$producto->stock : 'Sin stock' }}
                                    </p>
                                </div>
                                
                                <button onclick="addToCart({{ $producto->idproducto }}, {{ json_encode($producto->nombre) }}, {{ $producto->precio_venta }})" 
                                        {{ $producto->stock == 0 ? 'disabled' : '' }}
                                        class="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 font-medium text-sm">
                                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    </svg>
                                    <span>{{ $producto->stock == 0 ? 'Agotado' : 'Agregar al carrito' }}</span>
                                </button>
                            </div>
                        </div>
                        @endforeach
                    </div>

                    <!-- Pagination -->
                    <div class="mt-8">
                        {{ $productos->appends(request()->except('page'))->links('vendor.pagination.tailwind') }}
                    </div>
                @endif
            </main>
        </div>
    </div>

    <!-- WhatsApp CTA -->
    <div class="bg-gradient-to-r from-green-500 to-green-600 text-white py-10">
        <div class="max-w-4xl mx-auto px-4 text-center">
            <h2 class="text-2xl font-bold mb-2">¿Necesitas ayuda?</h2>
            <p class="text-green-100 mb-4">Escríbenos por WhatsApp y te atenderemos con gusto</p>
            <a href="https://wa.me/56938938614" target="_blank" class="inline-flex items-center bg-white text-green-600 px-6 py-3 rounded-full hover:bg-green-50 transition-colors font-bold">
                <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"/></svg>
                Contactar por WhatsApp
            </a>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-6">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; 2026 DondeMorales - Tu minimarket de confianza en Renaico</p>
        </div>
    </footer>

    <!-- Cart JavaScript -->
    <script>
        function getCart() {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        }
        
        function saveCart(cart) {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }
        
        function updateCartCount() {
            const cart = getCart();
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            const badge = document.getElementById('cart-count');
            if (badge) {
                badge.textContent = count;
                badge.classList.toggle('hidden', count === 0);
            }
        }
        
        function addToCart(id, name, price) {
            const cart = getCart();
            const existing = cart.find(item => item.id === id);
            
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }
            
            saveCart(cart);
            
            const button = event.target.closest('button');
            const originalText = button.innerHTML;
            button.innerHTML = '<span>Agregado ✓</span>';
            button.classList.add('bg-green-600');
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('bg-green-600');
            }, 1500);
        }
        
        // Busqueda en tiempo real
        let searchTimeout;
        document.getElementById('buscar')?.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (e.target.value.length >= 2 || e.target.value.length === 0) {
                    document.getElementById('search-form').submit();
                }
            }, 500);
        });
        
        updateCartCount();
    </script>
</body>
</html>
