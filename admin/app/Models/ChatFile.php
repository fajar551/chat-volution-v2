<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_reply_id',
        'chat_id',
        'name',
        'type',
        'path'
    ];

    public function chat_reply()
    {
        return $this->belongsTo(ChatReply::class, 'chat_reply_id', 'id');
    }
}
