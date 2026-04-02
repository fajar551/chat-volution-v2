<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Contracts\Activity;
use Illuminate\Support\Facades\Auth;

class TopicAgent extends Model
{
    use LogsActivity;

    protected $table = 'chat_topic_agent';
    public $timestamps = false;

    //only the `deleted` event will get logged automatically
    // protected static $recordEvents = ['deleted', 'created', 'updated'];

    // set log name
    protected static $logName = 'topic_agent';

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
        return "User has {$eventName} Topic Agent";
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

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'id_agent', 'id');
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class, 'id_topic', 'id');
    }
}
