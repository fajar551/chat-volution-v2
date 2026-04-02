<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnonymousAgent extends Model
{
    use HasFactory;

    protected $table = 'anonymous_agents';

    protected $fillable = [
        'anonymous_agent_id',
        'chat_group_id',
        'chat_group_internal_chat_id', // berisi id_chat_group, id_chat, chat_id
        'chat_id',
        'created_by', // id agent that create the row
        'id_chat',
        'image',
        'key',
        'name',
    ];

}
