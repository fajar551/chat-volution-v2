<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'company_name',
        'company_phone_number'
    ];

    /**
     * Relationship
     */
    public function agent()
    {
        return $this->belongsTo('App\Models\Agent', 'agent_id', 'id');
    }

    public function settings()
    {
        return $this->hasMany('App\Models\Setting', 'id_agent', 'agent_id');
    }
}
