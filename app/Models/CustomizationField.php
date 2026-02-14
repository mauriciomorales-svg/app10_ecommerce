<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomizationField extends Model
{
    protected $table = 'customization_fields';

    protected $fillable = [
        'product_id',
        'label',
        'field_key',
        'field_type',
        'is_required',
        'extra_cost',
        'options',
        'sort_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'extra_cost' => 'decimal:2',
        'options' => 'json',
        'sort_order' => 'integer',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'product_id', 'idproducto');
    }
}
