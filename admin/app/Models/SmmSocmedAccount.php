<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmmSocmedAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_socmed_id',
        'account_name',
        'alias_name',
        'token',
        'account_email',
        'description',
        'smm_socmed_channel_id',
        'json_result',
        'status',
        'created_by',
        'expired_at',
        'run_schedule'
    ];

    /**
     * Relationship
     */
    public function smm_socmed_channel()
    {
        return $this->belongsTo(SmmSocmedChannel::class, 'smm_socmed_channel_id', 'id');
    }

    public function smm_posts()
    {
        return $this->hasMany(SmmPost::class);
    }
}
