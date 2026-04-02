<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Contracts\Activity;
use Illuminate\Support\Facades\Auth;

class Department extends Model
{
    use LogsActivity;

    protected $table = 'agent_department';
    public $timestamps = false;

    public $fillable = [
        'id_agent', 'name', 'description', 'status'
    ];

    //only the `deleted` event will get logged automatically
    protected static $recordEvents = ['deleted', 'created', 'updated'];

    // set log name
    protected static $logName = 'department';

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
        return "User has {$eventName} Department";
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

    public function agent(){
    	return $this->belongsTo(Agent::class);
    }

    public function chats()
    {
        return $this->hasMany(Chat::class, 'id_department', 'id');
    }

    public function agentsOnDepartment()
    {
        return $this->hasMany(Agent::class, 'id_department', 'id');
    }
}
