<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductBundleOption extends Model
{
    protected $table = 'product_bundle_options';

    protected $fillable = [
        'parent_product_id',
        'child_product_id',
        'group_name',
        'input_type',
        'is_required',
        'price_modifier',
        'quantity_deduction',
        'sort_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'price_modifier' => 'decimal:2',
        'quantity_deduction' => 'integer',
        'sort_order' => 'integer',
    ];

    public function parentProduct()
    {
        return $this->belongsTo(Producto::class, 'parent_product_id', 'idproducto');
    }

    public function childProduct()
    {
        return $this->belongsTo(Producto::class, 'child_product_id', 'idproducto');
    }
}
