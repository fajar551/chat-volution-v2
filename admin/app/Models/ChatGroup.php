<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'uuid',
        'icon',
        'created_by'
    ];

    public function group_participants()
    {
        return $this->hasMany(ChatGroupAgent::class, 'chat_group_id', 'id');
    }

    public function company()
    {
        return $this->belongsTo(Agent::class, 'uuid', 'uuid');
    }

    public function created_by_relation()
    {
        return $this->hasOne(Agent::class, 'id', 'created_by');
    }

    public function agentsInGroup()
    {
        // for attach/detach agents to group
        return $this->belongsToMany(Agent::class, 'chat_group_agent', 'chat_group_id', 'agent_id');
    }

    public function agentsInChat()
    {
        // for attach/detach agents
        return $this->belongsToMany(Agent::class, 'internal_chat_agent', 'id_chat', 'id_agent');
    }

    public function internal_chat_relation()
    {
        // for attach/detach group to internal_chats
        return $this->hasOne(ChatGroupInternalChat::class, 'id_chat_group', 'id');
    }

    public function anonymous_agents()
    {
        return $this->hasMany(AnonymousAgent::class, 'chat_group_id', 'id');
    }
}
