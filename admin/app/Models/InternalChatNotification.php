<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalChatNotification extends Model
{
    use HasFactory;

    public $fillable = [
        'chat_id',
        'chat_type',
        'id_chat',
        'id_agent',
        'from_agent',
        'to_agent',
        'action',
        'is_read',
    ];

    protected $appends = ['chat_type_name'];

    function getChatTypeNameAttribute() {
        return __('chat.chat_type.'.$this->chat_type);
    }

    function actionFromAgentRelation()
    {
        return $this->hasOne(Agent::class, 'id', 'from_agent');
    }

    function actionToAgentRelation()
    {
        return $this->hasOne(Agent::class, 'id', 'to_agent');
    }

    function internal_chat()
    {
        return $this->hasOne(InternalChat::class, 'chat_id', 'chat_id');
    }
}
