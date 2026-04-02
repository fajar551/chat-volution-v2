<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalChatAgent extends Model
{
    use HasFactory;

    protected $table = 'internal_chat_agent';

    protected $fillable = [
        'chat_id',
        'id_chat',
        'id_agent'
    ];

    public function internal_chat()
    {
        return $this->belongsTo(InternalChat::class, 'id_chat', 'id');
    }

    public function agent()
    {
        return $this->hasOne(Agent::class, 'id', 'id_agent');
    }

    public function agent_filter($request)
    {
        return $this->hasOne(Agent::class, 'id', 'id_agent'); // wip
    }
}
