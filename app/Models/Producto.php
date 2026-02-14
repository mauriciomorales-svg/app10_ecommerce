<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producto extends Model
{
    protected $table = 'productos';
    protected $primaryKey = 'idproducto';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'descripcion',
        'codigobarra',
        'cantidad',
        'precio',
        'precio_costo',
        'imagen',
        'idcategoria',
        'idunidadmedida',
        'stock_actual',
        'stock_minimo',
        'alerta_stock_minimo',
        'activo',
        'es_pack',
        'ultima_venta',
        'veces_vendido',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'precio_costo' => 'decimal:2',
        'cantidad' => 'integer',
        'stock_actual' => 'integer',
        'stock_minimo' => 'integer',
        'alerta_stock_minimo' => 'integer',
        'activo' => 'boolean',
        'es_pack' => 'boolean',
        'ultima_venta' => 'datetime',
        'veces_vendido' => 'integer',
    ];

    protected $hidden = ['imagen'];
    protected $appends = ['precio_venta', 'stock', 'imagen_url', 'stock_disponible', 'has_bundle_options', 'has_customization'];

    public function getImagenUrlAttribute()
    {
        $codigo = $this->codigobarra ?? null;
        if ($codigo) {
            foreach (['jpg', 'jpeg', 'png', 'webp'] as $ext) {
                if (file_exists(public_path("fotos_productos/{$codigo}.{$ext}"))) {
                    return "/fotos_productos/{$codigo}.{$ext}";
                }
            }
        }
        // Fallback: imagen guardada en BD (bytea)
        $raw = $this->getAttributes()['imagen'] ?? null;
        if ($raw && (is_resource($raw) || strlen($raw) > 0)) {
            return "/api/productos/{$this->idproducto}/imagen";
        }
        return null;
    }

    // Accessor para compatibilidad con precio_venta
    public function getPrecioVentaAttribute()
    {
        return $this->precio;
    }

    // Accessor para compatibilidad con stock
    public function getStockAttribute()
    {
        return $this->stock_actual ?? $this->cantidad ?? 0;
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'idcategoria', 'idcategoria');
    }

    public function categorias(): BelongsToMany
    {
        return $this->belongsToMany(Categoria::class, 'producto_categoria', 'idproducto', 'idcategoria');
    }

    public function componentes(): BelongsToMany
    {
        return $this->belongsToMany(Producto::class, 'producto_composicion', 'id_pack', 'id_componente')
                    ->withPivot('cantidad');
    }

    public function perteneceAPacks(): BelongsToMany
    {
        return $this->belongsToMany(Producto::class, 'producto_composicion', 'id_componente', 'id_pack')
                    ->withPivot('cantidad');
    }

    public function getStockDisponibleAttribute()
    {
        if (!$this->es_pack) {
            return $this->stock;
        }

        $componentes = $this->componentes;
        if ($componentes->isEmpty()) {
            return 0;
        }

        return $componentes->map(function ($componente) {
            if ($componente->pivot->cantidad <= 0) return 0;
            return (int) floor($componente->stock_actual / $componente->pivot->cantidad);
        })->min();
    }

    public function bundleOptions(): HasMany
    {
        return $this->hasMany(ProductBundleOption::class, 'parent_product_id', 'idproducto')
                    ->orderBy('sort_order');
    }

    public function customizationFields(): HasMany
    {
        return $this->hasMany(CustomizationField::class, 'product_id', 'idproducto')
                    ->orderBy('sort_order');
    }

    public function getHasBundleOptionsAttribute(): bool
    {
        return $this->bundleOptions()->exists();
    }

    public function getHasCustomizationAttribute(): bool
    {
        return $this->customizationFields()->exists();
    }

    public function detalleVentas(): HasMany
    {
        return $this->hasMany(DetalleVenta::class, 'idproducto', 'idproducto');
    }

    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    public function getTieneStockAttribute()
    {
        return $this->stock > 0;
    }

    public function getPrecioFormateadoAttribute()
    {
        return '$' . number_format($this->precio, 0, ',', '.');
    }
}
