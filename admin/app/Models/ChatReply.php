<?php

namespace App\Models;

use App\Rules\ChatFileRule;
use Illuminate\Database\Eloquent\Model;

class ChatReply extends Model
{
    protected $table = 'chat_reply';

    public function chat()
    {
        return $this->belongsTo(Chat::class, 'chat_id', 'chat_id');
    }

    public function user()
    {
        return $this->hasOne('App\Models\User', 'id', 'id_users');
    }

    public function agent()
    {
        return $this->hasOne('App\Models\Agent', 'id', 'id_agent');
    }

    public function file_reply()
    {
        return $this->hasOne(ChatFile::class, 'chat_reply_id', 'id');
    }
}
