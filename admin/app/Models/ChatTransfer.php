<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_chat', 'from_agent', 'id_department', 'to_agent'
    ];

    public function chat_transfer()
    {
        return $this->belongsTo(Chat::class, 'id_chat', 'id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'id_department', 'id');
    }

    public function agent()
    {
        // has transfered from agent
        return $this->belongsTo(Agent::class, 'from_agent', 'id');
    }

    public function assigned_agent()
    {
        return $this->belongsTo(Agent::class, 'to_agent', 'uuid');
    }
}
