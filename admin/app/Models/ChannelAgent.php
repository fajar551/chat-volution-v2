<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChannelAgent extends Model{
    protected $table = 'chat_channel_agent';

    protected $fillable = [
        'id_agent', 'channel_id'
    ];

    public $timestamps = false;

    public function chat_channel_account()
    {
        return $this->hasOne(ChatChannelAccount::class, 'chat_channel_id', 'channel_id');
    }
}
