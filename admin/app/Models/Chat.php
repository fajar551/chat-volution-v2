<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $table = 'chat';

    protected $appends = ['status_name'];

    function getStatusNameAttribute() {
        return __('chat.status.'.$this->status);
    }

    public function chat_replies()
    {
        return $this->hasMany(ChatReply::class, 'chat_id', 'chat_id');
    }

    public function user()
    {
        return $this->belongsTo('App\Models\User', 'id_users', 'id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'id_department', 'id');
    }

    public function channel()
    {
        return $this->belongsTo(Channel::class, 'id_channel', 'id');
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class, 'id_topic', 'id');
    }

    public function chat_rating()
    {
        return $this->hasOne(Rating::class, 'chat_id', 'chat_id');
    }

    public function chat_agent()
    {
        return $this->hasOne(ChatAgent::class, 'id_chat', 'id')->latest(); // relation to chat_agent table
    }

    public function many_chat_agents()
    {
        return $this->hasMany(ChatAgent::class, 'id_chat', 'id')->orderBy('id', 'desc'); // relation to chat_agent table
    }

    public function chat_transfer()
    {
        return $this->hasOne(ChatTransfer::class, 'id_chat', 'id')->latest(); // only get latest record
    }

    public function labelsInChat()
    {
        // for attach/detach labels
        return $this->belongsToMany(ChatLabel::class, 'chat_label', 'id_chat', 'id_labels');
    }

    public function chat_labels()
    {
        // for get labels data
        return $this->hasMany(ChatLabel::class, 'id_chat', 'id');
    }

    public function history_chat_actions()
    {
        return $this->hasMany(HistoryChatAction::class, 'chat_id', 'chat_id');
    }

    public function owned_by()
    {
        return $this->belongsTo(Agent::class, 'uuid', 'uuid');
    }
}
