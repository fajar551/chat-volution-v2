<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Poll extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'created_by',
        'status',
        'expired_at',
        'id_chat',
        'chat_id',
        'chat_reply_id',
    ];

    public function poll_choices()
    {
        return $this->hasMany(PollChoice::class, 'poll_id', 'id');
    }

    public function internal_chat()
    {
        return $this->belongsTo(InternalChat::class, 'chat_id', 'chat_id');
    }

    public function internal_chat_reply()
    {
        return $this->belongsTo(InternalChatReply::class, 'chat_reply_id', 'id');
    }

    public function answerOfPoll()
    {
        // for attach/detach answer to poll
        return $this->belongsToMany(PollChoice::class, 'poll_answers', 'poll_id', 'agent_id')->withTimestamps();
    }

    public function poll_answers()
    {
        return $this->hasMany(PollAnswer::class);
    }

    public static function boot() {
        parent::boot();

        static::deleting(function($polling) {
            // here you could instantiate each related Poll
            // in this way the boot function in the Poll model will be called
            $polling->poll_choices->each(function($choice) {
                // and then the static::deleting method when you delete each one
                $choice->delete();
            });
        });
    }

}
