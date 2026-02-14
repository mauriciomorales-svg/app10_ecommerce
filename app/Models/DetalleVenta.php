<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleVenta extends Model
{
    protected $table = 'detalle_venta';
    protected $primaryKey = 'iddetalle_venta';
    public $timestamps = false;

    protected $fillable = [
        'idventa',
        'idproducto',
        'cantidad',
        'precio_venta',
        'descuento',
    ];

    protected $casts = [
        'cantidad' => 'integer',
        'precio_venta' => 'decimal:2',
        'descuento' => 'decimal:2',
    ];

    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class, 'idventa', 'idventa');
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class, 'idproducto', 'idproducto');
    }

    public function getSubtotalAttribute()
    {
        return ($this->cantidad * $this->precio_venta) - $this->descuento;
    }
}
