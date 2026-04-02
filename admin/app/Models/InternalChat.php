<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalChat extends Model
{
    use HasFactory;

    public $fillable = [
        'uuid',
        'chat_id',
        'chat_type',
        'noted',
        'status',
        'browser',
        'device',
        'ip',
        'unread_count',
        'created_at',
        'updated_at'
    ];

    protected $appends = ['chat_type_name', 'status_name'];

    function getChatTypeNameAttribute() {
        return __('chat.chat_type.'.$this->chat_type);
    }

    function getStatusNameAttribute() {
        return __('chat.internal_chat_status.'.$this->status);
    }

    public function agentsInChat()
    {
        // for attach/detach agents
        return $this->belongsToMany(Agent::class, 'internal_chat_agent', 'id_chat', 'id_agent');
    }

    public function private_chat_participants()
    {
        return $this->hasMany(InternalChatAgent::class, 'id_chat', 'id');
    }

    public function internal_chat_replies()
    {
        return $this->hasMany(InternalChatReply::class, 'chat_id', 'chat_id')->withTrashed();
    }

    public function latest_internal_chat_reply()
    {
        return $this->hasOne(InternalChatReply::class, 'chat_id', 'chat_id')->latest()->withTrashed();
    }

    public function has_pin_replies()
    {
        return $this->hasMany(InternalChatReply::class, 'chat_id', 'chat_id')->where('is_pinned', 1);
    }

    public function chat_group_relation()
    {
        return $this->belongsTo(ChatGroupInternalChat::class, 'id', 'id_chat');
    }

    public function deleted_conversation()
    {
        return $this->hasMany(InternalChatJoinedHistory::class, 'id_chat', 'id');
    }

    public function agentsInDeletedConv()
    {
        // for attach/detach agents from deleted conversation
        return $this->belongsToMany(Agent::class, 'internal_chat_joined_histories', 'id_chat', 'id_agent');
    }

    public function read_conversation_relation()
    {
        return $this->hasMany(InternalChatReadHistory::class, 'id_chat', 'id')->orderBy('read_date', 'desc');
    }

    public function agentsInReadConv()
    {
        // for attach/detach agents when agents has read/has not read the chat
        return $this->belongsToMany(Agent::class, 'internal_chat_read_histories', 'id_chat', 'id_agent');
    }
}
