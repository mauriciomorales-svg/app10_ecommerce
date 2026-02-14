<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Venta extends Model
{
    protected $table = 'venta';
    protected $primaryKey = 'idventa';
    public $timestamps = true;

    protected $fillable = [
        'numero_venta',
        'fecha',
        'estado',
        'idtrabajador_cajero',
        'idcaja',
        'medio_pago',
        'monto_efectivo',
        'monto_tarjeta',
        'total',
        'descuento',
        'subtotal',
        'fecha_finalizada',
        'observaciones',
        'idtrabajador_envio',
        'fecha_enviada',
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'total' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'descuento' => 'decimal:2',
    ];

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVenta::class, 'idventa', 'idventa');
    }

    public function trabajador(): BelongsTo
    {
        return $this->belongsTo(Trabajador::class, 'idtrabajador', 'idtrabajador');
    }

    public function scopeActivo($query)
    {
        return $query->where('estado', 'activo');
    }
}
