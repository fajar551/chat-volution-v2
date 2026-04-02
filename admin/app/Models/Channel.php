<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Channel extends Model
{
    protected $table = 'chat_channel';
    public $timestamps = false;

    public function chats()
    {
        return $this->hasMany(Chat::class, 'id_channel', 'id');
    }
}
