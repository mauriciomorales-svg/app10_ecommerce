# Multi‑tienda ecommerce (plantilla premium)

Una misma base de código y de datos puede servir **varias tiendas** (cada una con su dominio y catálogo). DondeMorales puede ser la primera fila (`default`); otras premium son filas extra en `commerce_stores` con productos asignados a `commerce_store_id`.

## Migración

Ejecutar en el proyecto **`app10_ecommerce`** (misma BD que `productos`):

```bash
php artisan migrate
```

Crea `commerce_stores` (incluye fila `slug=default`) y columna `productos.commerce_store_id` (los productos existentes quedan en la tienda `default`).

Para que **dondemorales.cl** resuelva a esa tienda en producción:

```bash
php artisan commerce:store-set-host default dondemorales.cl
```

(o SQL equivalente: `UPDATE commerce_stores SET primary_host = 'dondemorales.cl' WHERE slug = 'default';`)

## Resolución de tienda (Next / storefront)

En cada request **API**, el middleware `AssignCommerceStore` resuelve la tienda por el **Host** HTTP:

1. Coincidencia con `commerce_stores.primary_host` (sin importar mayúsculas).
2. Si no, coincidencia con algún valor en `host_aliases` (lista separada por comas).
3. Si no, tienda cuyo `slug` sea `COMMERCE_DEFAULT_STORE_SLUG` (por defecto `default`).

Los listados de productos y categorías aplican **alcance global** en el modelo `Producto` (`commerce_store_id` = tienda actual).

## Alta de una nueva tienda (plantilla / premium)

```bash
php artisan commerce:store-create floreria-x "Florería X" --host=tienda.floreria.cl --template
```

Luego asignar catálogo:

```sql
UPDATE productos SET commerce_store_id = <id> WHERE …;
```

(o insertar productos nuevos ya con ese `commerce_store_id`).

## inventario-api (catálogo web / Flutter)

Las rutas bajo `GET/POST …/api/catalogo/{productoId}/…` usan middleware `ResolveCommerceStoreContext`:

- Cabecera opcional **`X-Commerce-Store-Slug`**: debe coincidir con `commerce_stores.slug`.
- Si no se envía, se usa **`COMMERCE_DEFAULT_STORE_SLUG`** (misma convención que en `config/commerce.php` del ecommerce).

Las operaciones validan que el producto padre y los hijos (variantes / sugerencias) pertenezcan a esa tienda.

**Base de datos:** en el despliegue típico DondeMorales + inventario, **`app10_ecommerce`** e **`inventario-api`** comparten PostgreSQL y el mismo **`DB_DATABASE`** (p. ej. `dbisabel2`). Si no comparten nombre de base, el catálogo no queda unificado entre la tienda web y la API de inventario.

## Variables `.env`

**app10_ecommerce** e **inventario-api** (misma convención):

- `COMMERCE_DEFAULT_STORE_SLUG=default`

## Notas

- La **tienda worker** en JobsHours (`/tienda/{id}`) sigue siendo el catálogo simple del experto; esto no la reemplaza.
- Para clonar una plantilla “tipo DondeMorales” en otra marca: nueva fila en `commerce_stores` + productos/categorías con el `commerce_store_id` correspondiente.
