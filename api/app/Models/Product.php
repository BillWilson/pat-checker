<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Pgvector\Laravel\Vector;

class Product extends Model
{
    protected static $unguarded = true;

    protected $casts = [
        'company_name' => 'string',
        'name' => 'string',
        'description' => 'string',
        'product_vector' => Vector::class,
    ];
}
