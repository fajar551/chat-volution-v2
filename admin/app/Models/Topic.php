<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Contracts\Activity;
use Illuminate\Support\Facades\Auth;

class Topic extends Model
{
    use LogsActivity;

    protected $table = 'chat_topic';
    public $timestamps = false;

    protected $appends = ['status_name'];

    //only the `deleted` event will get logged automatically
    // protected static $recordEvents = ['deleted', 'created', 'updated'];

    // set log name
    protected static $logName = 'topic';

    // log the changed attributes for all event
    protected static $logAttributes = ['*'];

    // attributes will not trigger an activity log
    protected static $ignoreChangedAttributes = ['updated_at'];

    // log only changed attributes
    protected static $logOnlyDirty = true;

    /**
     * getDescriptionForEvent - function used to customized the description
     *
     * @param String $eventName [$eventName description]
     *
     * @return String           [return description]
     */
    public function getDescriptionForEvent(string $eventName): string
    {
        return "User has {$eventName} Topic";
    }

    /**
     * tapActivity - fill properties and add custom fields before the activity is saved.
     */
    public function tapActivity(Activity $activity, string $eventName)
    {
        $activity->ip = \Request::ip() ?: null;
        $activity->user_agent = \Request::header('user-agent') ?: null;
        if(Auth::check()){
            $activity->email = Auth::user()->email ?: null;
        }
    }

    function getStatusNameAttribute()
    {
        return __('messages.topic_status.'.$this->status);
    }

    public function chats()
    {
        return $this->hasMany(Chat::class, 'id_topic', 'id');
    }

    public function topic_agents()
    {
        return $this->hasMany(TopicAgent::class, 'id_topic', 'id');
    }

    public function agentsInTopic()
    {
        // for attach/detach agents to topic
        return $this->belongsToMany(Agent::class, 'chat_topic_agent', 'id_topic', 'id_agent');
    }
}
