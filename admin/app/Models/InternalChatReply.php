<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InternalChatReply extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'id_chat',
        'chat_id',
        'from_agent_id',
        'message',
        'parent',
        'is_pinned',
        'from_anonymous',
        'meeting_url'
    ];

    protected $appends = ['reply_is_deleted', 'is_meeting'];

    function getReplyIsDeletedAttribute() {
        if($this->deleted_at) {
            $this->meeting_url = null; // set meeting url to null
            return true; // set value of reply_is_deleted
        } else {
            return false;
        }
    }

    function getIsMeetingAttribute() {
        if($this->meeting_url && checkUrl($this->meeting_url) && empty($this->deleted_at)) {
            return true;
        } else {
            return false;
        }
    }

    public function agent()
    {
        return $this->hasOne(Agent::class, 'id', 'from_agent_id');
    }

    public function internal_file_reply()
    {
        return $this->hasOne(InternalChatFile::class, 'internal_chat_reply_id', 'id');
    }

    public function has_parent()
    {
        return $this->belongsTo(InternalChatReply::class, 'parent', 'id');
    }

    public function internal_chat()
    {
        return $this->belongsTo(InternalChat::class, 'chat_id', 'chat_id');
    }

    public function poll()
    {
        return $this->hasOne(Poll::class, 'chat_reply_id', 'id');
    }
}
