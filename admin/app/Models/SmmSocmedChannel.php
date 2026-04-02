<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmmSocmedChannel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'image_logo', 'ic_logo', 'slug', 'status',
    ];

    /**
     * Append new column
     */
    // protected $appends = ['image_logo_url'];

    // public function getImageLogoUrlAttribute()
    // {
    //     return asset($this->image_logo);
    // }

    /**
     * Relationship
     */
    public function smm_socmed_account()
    {
        return $this->hasMany(SmmSocmedAccount::class, 'smm_socmed_channel_id', 'id');
    }
}
