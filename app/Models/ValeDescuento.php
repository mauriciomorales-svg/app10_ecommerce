<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValeDescuento extends Model
{
    protected $table = 'vale_descuento';

    protected $primaryKey = 'idvale';

    public $incrementing = true;

    protected $fillable = [
        'codigo',
        'tipo',
        'valor',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'usos_maximos',
        'usos_actuales',
        'activo',
        'monto_minimo',
        'solo_primera_compra',
        'hora_inicio',
        'hora_fin',
        'dias_semana',
    ];

    protected $casts = [
        'valor' => 'float',
        'activo' => 'boolean',
        'solo_primera_compra' => 'boolean',
        'monto_minimo' => 'integer',
        'usos_maximos' => 'integer',
        'usos_actuales' => 'integer',
        'hora_inicio' => 'integer',
        'hora_fin' => 'integer',
    ];
}
