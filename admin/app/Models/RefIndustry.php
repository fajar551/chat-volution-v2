<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefIndustry extends Model
{
    protected $table = 'ref_industries';

    protected $fillable = [
        'name'
    ];

    protected $hidden = [
        'created_at', 'updated_at'
    ];
}
