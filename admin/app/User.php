<?php

namespace App;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Contracts\Auth\CanResetPassword;

class User extends Authenticatable implements CanResetPassword
{
    use HasRoles, HasApiTokens, Notifiable;

    protected $table = 'agent';
    protected $guard_name = 'api';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password', 'id_roles', 'id_department', 'id_company', 'status', 'is_email_verified', 'phone', 'uuid', 'avatar', 'user_json', 'online','fcm_token'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function sendPasswordResetNotification($token)
    {
        $url = route('password.reset').'?token='.$token . '&email=' . urlencode($this->email);
        $this->notify(new \App\Notifications\MailResetPasswordNotification(['url' => $url, 'email' => $this->email, 'name' => $this->name]));
    }
}
