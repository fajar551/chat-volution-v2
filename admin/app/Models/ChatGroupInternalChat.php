<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatGroupInternalChat extends Model
{
    use HasFactory;

    protected $table = 'chat_group_internal_chat';

    protected $fillable = [
        'id_chat_group',
        'id_chat',
        'chat_id'
    ];

    public function internal_chat()
    {
        // for attach/detach group to internal_chats
        return $this->hasOne(InternalChat::class, 'id', 'id_chat');
    }

    public function chat_group()
    {
        // for attach/detach group to internal_chats
        return $this->hasOne(ChatGroup::class, 'id', 'id_chat_group');
    }
}
