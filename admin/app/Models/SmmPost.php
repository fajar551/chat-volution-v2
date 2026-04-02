<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmmPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'smm_socmed_account_id',
        'content',
        'status',
        'json_result',
        'smm_schedule_id',
    ];

    /**
     * Relationship
     */
    public function smm_socmed_account()
    {
        return $this->belongsTo(SmmSocmedAccount::class);
    }
}
