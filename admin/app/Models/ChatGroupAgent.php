<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatGroupAgent extends Model
{
    use HasFactory;

    protected $table = 'chat_group_agent';

    public function agent()
    {
        return $this->hasOne(Agent::class, 'id', 'agent_id');
    }
}
