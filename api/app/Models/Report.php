<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected static $unguarded = true;

    protected $casts = [
        'patent_id' => 'string',
        'company_name' => 'string',
        'result' => 'array',
    ];
}
