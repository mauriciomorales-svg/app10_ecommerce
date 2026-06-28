<?php

namespace App\Models;

use App\Support\VentaEstado;
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
        'cliente_nombre',
        'cliente_email',
        'cliente_telefono',
        'fecha_retiro',
        'codigo_retiro',
        'packaging_key',
        'packaging_label',
        'packaging_amount',
        'subtotal_productos',
        'estado_retiro',
        'fulfillment_type',
        'delivery_amount',
        'delivery_address',
        'delivery_lat',
        'delivery_lng',
        'delivery_distance_km',
        'jobshours_request_id',
        'jobshours_publish_status',
        'jobshours_publish_attempts',
        'jobshours_publish_error',
        'jobshours_delivery_status',
        'jobshours_request_status',
        'jobshours_payment_status',
        'jobshours_status_synced_at',
        'delivery_notified_at',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'referrer',
        'landing_path',
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'fecha_retiro' => 'date',
        'fecha_finalizada' => 'datetime',
        'total' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'descuento' => 'decimal:2',
        'packaging_amount' => 'decimal:2',
        'subtotal_productos' => 'decimal:2',
        'delivery_amount' => 'decimal:2',
        'delivery_lat' => 'float',
        'delivery_lng' => 'float',
        'delivery_distance_km' => 'float',
        'jobshours_status_synced_at' => 'datetime',
        'delivery_notified_at' => 'datetime',
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
        return VentaEstado::scopePaid($query);
    }

    public function scopePagada($query)
    {
        return VentaEstado::scopePaid($query);
    }
}
