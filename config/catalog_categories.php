<?php

/**
 * Reglas para asignar categorías por nombre de producto.
 * El orden importa: reglas más específicas primero.
 */
return [
    'product_id_overrides' => [
        1961 => 'Empaque y regalo',
        1962 => 'Empaque y regalo',
        1963 => 'Empaque y regalo',
        1913 => 'Bebidas',
        403 => 'Regalos y Ocasiones',
        1922 => 'Frutas y Verduras',
        1923 => 'Frutas y Verduras',
    ],

    'skip_name_patterns' => [
        'ajuste', 'venta directa', 'prueba', 'test ',
        'yogurt ', 'soft ', 'artesanal ', 'formato copa', 'formato ',
        'base papas', 'base tortilla', 'base tallarines', 'base arroz',
        'porción personal base', 'porción familiar base', 'toppi salsa', 'toppi frutilla',
        'toppi plátano', 'toppi mango', 'toppi maní', 'toppi galleta', 'toppi brownie',
        'toppi nutella', 'toppi oreo', 'toppi marshmallow', 'toppi huevo', 'toppi palta',
        'toppi champiñón', 'toppi queso', 'toppi carne', 'toppi tomate', 'toppi chucrut',
        'toppi mayo', 'toppi tocino', 'toppi cebolla crispy',         'toppi queso fundido',
        'pollo teriyaki', 'cerdo agridulce', 'camarón salteado', 'salsa swicy', 'salsa teriyaki',
        'fideos de arroz', 'arroz chaufa', 'sésamo tostado', 'mix vegetales wok',
    ],

    'rules' => [
        // —— Toppi's (antes que lácteos / abarrotes por palabras sueltas) ——
        ['patterns' => ['wok y bowl toppi', 'bowl swicy', 'wok y bowls'], 'categoria' => 'Wok y Bowls Toppi\'s'],
        ['patterns' => [
            'bowl swicy pollo', 'pollo teriyaki', 'cerdo agridulce', 'camarón salteado',
            'salsa swicy', 'salsa teriyaki', 'fideos de arroz', 'arroz chaufa', 'mix vegetales wok',
        ], 'categoria' => 'Wok y Bowls Toppi\'s'],
        ['patterns' => ['helado toppi'], 'categoria' => 'Helados Toppi\'s'],
        ['patterns' => ['base salada toppi'], 'categoria' => 'Bases saladas Toppi\'s'],
        ['patterns' => ['chorrillana toppi', 'tipo clásica', 'tipo italiana', 'tipo boloñesa', 'tipo boloñesa picante'], 'categoria' => 'Chorrillanas Toppi\'s'],
        ['patterns' => [
            'chorrillana clásica', 'chorrillana italiana', 'chorrillana boloñesa',
            'chorrillana boloñesa picante', 'chorrillana personal',
            'extra papas', 'extra champ', 'extra morron', 'extra choclo', 'extra queso', 'extra aji',
            'extra palta', 'extra palmitos', 'extra pickles',
        ], 'categoria' => 'Chorrillanas Toppi\'s'],
        ['patterns' => ['completo toppi', 'churrasco toppi'], 'categoria' => 'Completos y Churrascos Toppi\'s'],
        ['patterns' => [
            'salchipapas', 'papas con queso',
            'completo italiano', 'completo dinámico', 'completo chacarero', 'churrasco clásico',
        ], 'categoria' => 'Platos listos Toppi\'s'],
        ['patterns' => [
            'jugo natural del día', 'jugo natural litro',
            'coca-cola lata', 'coca-cola 1.5', 'agua mineral sin gas', 'cerveza lata',
        ], 'categoria' => 'Bebidas y Jugos'],

        // —— Bebidas (específicas antes que genéricas) ——
        ['patterns' => ['coca cola', 'coca-cola', 'coca ', 'pepsi', 'sprite', 'fanta', 'schweppes', 'crush', 'seven up', '7up', 'canada dry'], 'categoria' => 'Bebidas'],
        ['patterns' => ['cachantun', 'vital ', 'billiken', 'bilz', 'pap ', 'kem ', 'bebida', 'jugo ', 'nectar', 'néctar'], 'categoria' => 'Bebidas'],
        ['patterns' => ['cerveza', 'quilmes', 'corona', 'escudo', 'kunstmann', 'heineken', 'budweiser', 'stella'], 'categoria' => 'Bebidas'],
        ['patterns' => ['gatorade', 'powerade', 'monster', 'red bull', 'burn ', 'speed max'], 'categoria' => 'Bebidas'],
        ['patterns' => ['cafe ', 'café', 'nescafe', 'nescafé', 'capuccino', 'cappuccino', 'milo ', 'horlicks'], 'categoria' => 'Bebidas'],
        ['patterns' => ['te lipton', 'té lipton', 'té', 'te ', 'infusion', 'agua mineral', 'agua '], 'categoria' => 'Bebidas'],

        // —— Snacks (antes que lácteos por "queso") ——
        ['patterns' => ['dorito', 'cheeto', 'chetos', 'ramitas', 'papas frit', 'pringles', 'lays'], 'categoria' => 'Snacks y Golosinas'],
        ['patterns' => ['gallet', 'oreo', 'cookie', 'club social', 'mckay', 'triton', 'cereal ', 'alfajor', 'chubi', 'roket', 'huevito', 'de todito', 'in kat'], 'categoria' => 'Snacks y Golosinas'],
        ['patterns' => ['snack', 'chizito', 'palito', 'maní', 'mani ', 'cacahuate', 'doblon', 'tiffany', 'sublime'], 'categoria' => 'Snacks y Golosinas'],

        // —— Chocolates ——
        ['patterns' => ['chocolate', 'sublime', 'trencito', 'kinder', 'hershey', 'savoy', 'ambrosoli'], 'categoria' => 'Chocolates'],

        // —— Lácteos ——
        ['patterns' => ['leche ', 'yogur', 'yogurt', 'queso ', 'mantequilla', 'milko', 'soprole', 'colun', 'calo'], 'categoria' => 'Lácteos'],
        ['patterns' => ['manjar', 'mermelada', 'nutella', 'mantequilla de mani'], 'categoria' => 'Lácteos'],

        // —— Panadería ——
        ['patterns' => ['pan lactal', 'marraqueta', 'hallulla', 'pan de molde', 'tostada', 'bimbo'], 'categoria' => 'Panadería y Cereales'],

        // —— Abarrotes ——
        ['patterns' => ['arroz', 'fideo', 'fideos', 'macarron', 'spaghetti', 'avecrem'], 'categoria' => 'Abarrotes'],
        ['patterns' => ['aceite', 'yerba', 'azucar', 'azúcar', 'sal ', 'harina', 'lenteja', 'poroto', 'garbanzo'], 'categoria' => 'Abarrotes'],
        ['patterns' => ['atun', 'atún', 'conserva', 'salsa de tomate', 'ketchup', 'mayonesa', 'mostaza'], 'categoria' => 'Abarrotes'],
        ['patterns' => ['condimento', 'curcuma', 'comino', 'oregano', 'merken'], 'categoria' => 'Condimentos y Especias'],

        // —— Carnes ——
        ['patterns' => ['huevo', 'pollo', 'carne ', 'vienesa', 'vienesa', 'jamón', 'jamon', 'salchicha', 'chorizo', 'longaniza'], 'categoria' => 'Carnes y Embutidos'],

        // —— Congelados ——
        ['patterns' => ['congelad', 'nugget', 'hamburguesa', 'papas prefrit'], 'categoria' => 'Congelados'],

        // —— Frutas y verduras ——
        ['patterns' => ['frutas ', 'verduras ', 'tomate', 'cebolla', 'papa ', 'palta', 'lechuga', 'zanahoria', 'frutilla', 'manzana', 'plátano', 'platano', 'naranja', 'limón', 'limon', 'durazno', 'uva ', 'pera '], 'categoria' => 'Frutas y Verduras'],

        // —— Limpieza ——
        ['patterns' => ['papel hig', 'deterg', 'cloro', 'lavavaj', 'limpieza', 'trapo', 'esponja', 'mister musculo', 'poett', 'ayudin'], 'categoria' => 'Limpieza del Hogar'],

        // —— Cuidado personal ——
        ['patterns' => ['shampoo', 'champú', 'jabon', 'jabón', 'desodor', 'desorante', 'pasta dental', 'colgate', 'trident', 'cepillo dental', 'prestobarba', 'afeit', 'nivea', 'dove', 'axe ', 'locion', 'loción', 'perfume', 'crema ', 'acetona', 'quita esmalte', 'esmalte', 'panty', 'panti', 'pantipred', 'protector diario', 'tampon', 'toalla fem', 'lady stick', 'hipoalerg'], 'categoria' => 'Cuidado Personal'],
        ['patterns' => ['huggies', 'toalla hig', 'protector', 'algodón', 'algodon', 'baby care'], 'categoria' => 'Cuidado Personal'],
        ['patterns' => ['toalla ploma', 'toalla humeda', 'toalla húmeda'], 'categoria' => 'Cuidado Personal'],

        // —— Farmacia ——
        ['patterns' => ['eno', 'paracet', 'aspirina', 'medic', 'curita', 'omeprazol', 'ibuprofeno', 'geniol', 'alka seltzer', 'alka ', 'alcohol concentrado', 'alcohol gel'], 'categoria' => 'Farmacia Básica'],

        // —— Tabaco ——
        ['patterns' => ['cigarro', 'cigarrillo', 'tabaco', 'encendedor', 'pall mall', 'lucky strike', 'mustang', 'marlboro', 'winston', 'camel'], 'categoria' => 'Cigarrillos y Tabaco'],

        // —— Librería ——
        ['patterns' => ['cuaderno', 'lapiz', 'lápiz', 'lápiz', 'escolar', 'librer', 'libreta', 'block ', 'plumon', 'plumón', 'marcador', 'destacador', 'pincel', 'pinsel', 'acuarela', 'greda', 'notas adesivas', 'plasticina', 'corchete', 'sacacorchete', 'pistola silicona', 'minas isofit', 'set lana'], 'categoria' => 'Librería y Escolar'],

        // —— Regalos / packs (patrones específicos; evitar "pack" genérico) ——
        ['patterns' => ['bolsa regalo', 'bolsita regalo', 'caja regalo', 'tarjeta regalo', 'canasta familiar', 'pack desayuno', 'pack once', 'polera ', 'muñeca', 'muñeco', 'peluche', 'balerina brillo'], 'categoria' => 'Regalos y Ocasiones'],

        // —— Ferretería / misc ——
        ['patterns' => ['ferreter', 'tornillo', 'cinta ', 'pegamento', 'foco', 'ampolleta', 'cuchillo', 'pvc ', 'audifono', 'audífono', 'cargador', 'cable usb', 'pila ', 'bateria'], 'categoria' => 'Ferretería y Hogar'],
        ['patterns' => ['bolsita 26x', 'bolsa 26x', 'bolsita 18x'], 'categoria' => 'Empaque y regalo'],

        // —— Mascotas (evitar "gato" suelto → Gatorade) ——
        ['patterns' => ['alimento perro', 'alimento gato', 'master dog', 'pedigree', 'dog chow', 'cat chow', 'mascota'], 'categoria' => 'Mascotas'],

        // —— Bebés ——
        ['patterns' => ['bebe', 'bebé', 'pañal', 'pañales', 'nan ', 'similac'], 'categoria' => 'Bebés'],

        // —— Empaque ——
        ['patterns' => ['bolsa estándar', 'bolsa reforzada', 'traigo mi bolsa', 'bolsa compra', 'bolsa reutil', 'caja regalo', 'empaque', 'envoltorio'], 'categoria' => 'Empaque y regalo'],
        ['patterns' => ['boxer', 'calzon', 'calzón', 'ropa interior'], 'categoria' => 'Regalos y Ocasiones'],
    ],
];
