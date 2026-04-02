<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalChatJoinedHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id', 'id_chat', 'id_agent', 'added_date', 'removed_date', 'conversation_deleted'
    ];
}
