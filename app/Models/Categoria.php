<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model
{
    protected $table = 'categoria';
    protected $primaryKey = 'idcategoria';
    public $timestamps = false;

    protected $fillable = ['nombre', 'descripcion', 'estado'];

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'idcategoria', 'idcategoria');
    }

    public function scopeActivo($query)
    {
        return $query->where('estado', 'activo');
    }
}
