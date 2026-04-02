<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternalChatFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'internal_chat_reply_id',
        'chat_id',
        'name',
        'type',
        'path'
    ];

    public function internal_chat_reply()
    {
        return $this->belongsTo(InternalChatReply::class, 'id', 'internal_chat_reply_id');
    }
}
