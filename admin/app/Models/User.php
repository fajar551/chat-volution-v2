<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        // 'name', 'email', 'password', 'id_roles', 'id_department', 'id_company', 'status', 'is_email_verified', 'phone', 'uuid', 'avatar', 'user_json'
        'id_whmcs', 'reg_whmcs', 'total_transaction', 'whmcs', 'name', 'email', 'phone', 'noted', 'user_json'
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

    public function chats()
    {
        return $this->hasMany(Chat::class, 'id_users', 'id');
    }
}
