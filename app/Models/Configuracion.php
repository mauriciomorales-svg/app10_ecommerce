<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    protected $table = 'configuracion';

    protected $primaryKey = 'idconfiguracion';

    public $timestamps = false;

    protected $fillable = [
        'clave',
        'valor',
        'tipo',
        'descripcion',
    ];

    public static function obtener(string $clave, mixed $default = null): mixed
    {
        $config = self::where('clave', $clave)->first();

        if (! $config) {
            return $default;
        }

        return match ($config->tipo) {
            'number' => is_numeric($config->valor) ? (float) $config->valor : $default,
            'boolean' => filter_var($config->valor, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($config->valor, true) ?? $default,
            default => $config->valor,
        };
    }

    public static function establecer(string $clave, mixed $valor, string $tipo = 'string'): bool
    {
        if ($tipo === 'json' && is_array($valor)) {
            $valor = json_encode($valor, JSON_UNESCAPED_UNICODE);
        } elseif ($tipo === 'boolean') {
            $valor = $valor ? 'true' : 'false';
        } else {
            $valor = (string) $valor;
        }

        return self::updateOrCreate(
            ['clave' => $clave],
            ['valor' => $valor, 'tipo' => $tipo]
        ) !== null;
    }
}
