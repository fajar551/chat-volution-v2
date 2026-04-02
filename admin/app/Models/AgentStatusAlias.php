<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentStatusAlias extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id', 'uuid', 'name', 'expired_at'
    ];
}
