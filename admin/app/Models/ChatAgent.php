<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatAgent extends Model
{
    use HasFactory;

    protected $table = 'chat_agent';

    protected $fillable = [
        'id_chat', 'id_agent'
    ];

    public function chat()
    {
        return $this->belongsTo(Chat::class, 'id_chat', 'id');
    }

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'id_agent', 'id');
    }

    public function agent_chat_transfer()
    {
        return $this->hasOne(ChatTransfer::class, 'id_chat', 'id_chat')->latest(); // only get latest record
    }
}
