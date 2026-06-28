<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KioskSearchLog extends Model
{
    protected $table = 'kiosk_search_logs';

    public $timestamps = false;

    protected $fillable = [
        'device_id',
        'query',
        'query_normalized',
        'outcome',
        'input_method',
        'results_count',
        'total_results',
        'product_ids',
        'from_cache',
        'did_you_mean',
        'duration_ms',
        'created_at',
    ];

    protected $casts = [
        'product_ids' => 'array',
        'from_cache' => 'boolean',
        'results_count' => 'integer',
        'total_results' => 'integer',
        'duration_ms' => 'integer',
        'created_at' => 'datetime',
    ];

    public function outcomeLabel(): string
    {
        return match ($this->outcome) {
            'found' => 'Encontrado',
            'not_found' => 'No encontrado',
            'partial' => 'Similar',
            'out_of_stock' => 'Sin stock',
            'product_detail' => 'Detalle',
            'menu' => 'Menú',
            default => 'Otro',
        };
    }

    public function outcomeColor(): string
    {
        return match ($this->outcome) {
            'found', 'product_detail' => 'success',
            'not_found' => 'danger',
            'partial' => 'warning',
            'out_of_stock' => 'info',
            default => 'gray',
        };
    }
}
