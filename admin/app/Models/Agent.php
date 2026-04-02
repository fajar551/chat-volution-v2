<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Passport\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Contracts\Activity;

class Agent extends Model
{
    use HasRoles, HasApiTokens, Notifiable, LogsActivity;

    protected $table = 'agent';
    // protected $primaryKey = 'id_department'; // comment this because we can not get 'id' directly after save record/save data
    protected $guard_name = 'api';

    protected $fillable = [
        'name', 'email', 'password', 'id_roles', 'id_department', 'id_company', 'status', 'full_access', 'is_email_verified', 'phone', 'uuid', 'avatar', 'user_json', 'online', 'fcm_token'
    ];

    protected $hidden = [
        'password', 'remember_token', 'activation_token'
    ];

    public $avail_roles = [
        1 => 'Administrator',
        2 => 'Company',
        3 => 'Staff',
        4 => 'Agent',
        5 => 'Developer'
    ];

    protected $appends = ['status_name'];

    function getStatusNameAttribute() {
        return __('agent.avail_statuses.'.$this->status);
    }

    //only the `deleted` event will get logged automatically
    // protected static $recordEvents = ['deleted', 'created', 'updated'];

    // set log name
    protected static $logName = 'agent';

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
        return "User has {$eventName} Agent";
    }

    /**
     * tapActivity - fill properties and add custom fields before the activity is saved.
     */
    public function tapActivity(Activity $activity, string $eventName)
    {
        $activity->ip = \Request::ip() ?: null;
        $activity->user_agent = \Request::header('user-agent') ?: null;
        $activity->email = $this->email ?: null;
    }

    public function department()
    {
        //return $this->belongsTo(Department::class);
        return $this->belongsTo('App\Models\Department', 'id_department');
    }

    public function company_detail()
    {
        return $this->hasOne('App\Models\CompanyDetail', 'agent_id', 'id');
    }

    public function companyDetailByIdCompany()
    {
        return $this->hasOne('App\Models\CompanyDetail', 'agent_id', 'id_company');
    }

    public function client_keys()
    {
        return $this->hasMany('App\Models\AgentOauthClient', 'agent_uuid', 'uuid');
    }

    public function chat_reply()
    {
        return $this->belongsTo('App\Models\ChatReply', 'id_agent', 'id');
    }

    public function settings()
    {
        return $this->hasMany('App\Models\Setting', 'id_agent', 'id');
    }

    public function ratings()
    {
        return $this->hasMany(Rating::class, 'id_agent', 'id');
    }

    public function agent_topic()
    {
        return $this->hasMany(TopicAgent::class, 'id_agent', 'id');
    }

    public function chat_agent()
    {
        return $this->hasOne(ChatAgent::class, 'id_agent', 'id');
    }

    public function chat_channel_agent()
    {
        return $this->hasMany(ChannelAgent::class, 'id_agent', 'id');
    }

    public function status_alias()
    {
        return $this->hasOne(AgentStatusAlias::class, 'agent_id', 'id')->where('expired_at', '>=', now());
    }

    public function agentsInChat()
    {
        // for attach/detach agents
        return $this->belongsToMany(InternalChat::class, 'internal_chat_agent', 'id_agent', 'id_chat');
    }

}
