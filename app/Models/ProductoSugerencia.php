<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoSugerencia extends Model
{
    protected $table = 'producto_sugerencias';

    protected $fillable = [
        'producto_origen_id',
        'producto_sugerido_id',
        'mensaje',
        'tipo',
        'orden',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'orden' => 'integer',
    ];

    public function productoOrigen(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_origen_id', 'idproducto');
    }

    public function productoSugerido(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'producto_sugerido_id', 'idproducto');
    }
}
