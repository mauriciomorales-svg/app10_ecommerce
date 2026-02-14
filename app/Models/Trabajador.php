<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trabajador extends Model
{
    protected $table = 'trabajador';
    protected $primaryKey = 'idtrabajador';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'apellidos',
        'direccion',
        'email',
        'telefono',
        'cargo',
        'login',
        'password',
        'rol',
        'pin',
        'estado',
    ];

    public function ventas(): HasMany
    {
        return $this->hasMany(Venta::class, 'idtrabajador', 'idtrabajador');
    }
}
