<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgentWhmcsAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_agent',
        'uuid',
        'domain',
        'identifier',
        'secret',
        'status',
        'raw_response'
    ];
}
