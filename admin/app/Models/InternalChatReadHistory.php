<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalChatReadHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id', 'id_chat', 'id_agent', 'unread_date', 'read_date'
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'id_agent', 'id');
    }
}
