<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model
{
    protected $table = 'categoria';
    protected $primaryKey = 'idcategoria';
    public $timestamps = false;

    protected $fillable = ['nombre', 'descripcion', 'activo'];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'idcategoria', 'idcategoria');
    }

    public function productosPivot(): BelongsToMany
    {
        return $this->belongsToMany(Producto::class, 'producto_categoria', 'idcategoria', 'idproducto');
    }

    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }
}
