<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductHosting extends Model
{
    use HasFactory;
    protected $fillable = [
        'product_name',
        'pid',
        'panel',
        'kapasitas',
        'akun_email',
        'tipe_hosting',
        'link',
    ];
}
