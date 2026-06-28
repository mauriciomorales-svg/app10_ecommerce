<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSearchLog extends Model
{
    protected $table = 'store_search_logs';

    public $timestamps = false;

    protected $fillable = [
        'query',
        'query_normalized',
        'scope',
        'outcome',
        'total_results',
        'session_id',
        'page',
        'created_at',
    ];

    protected $casts = [
        'total_results' => 'integer',
        'created_at' => 'datetime',
    ];

    public function scopeLabel(): string
    {
        return match ($this->scope) {
            'regalos' => 'Regalos',
            'salada' => 'Comida',
            'helados' => 'Helados',
            'packs' => 'Packs',
            'home' => 'Inicio',
            default => ucfirst($this->scope),
        };
    }

    public function outcomeLabel(): string
    {
        return match ($this->outcome) {
            'found' => 'Con resultados',
            'not_found' => 'Sin resultados',
            default => 'Otro',
        };
    }

    public function outcomeColor(): string
    {
        return match ($this->outcome) {
            'found' => 'success',
            'not_found' => 'danger',
            default => 'gray',
        };
    }
}
