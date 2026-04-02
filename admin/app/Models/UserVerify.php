<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\User;

class UserVerify extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'token',
    ];

    public function agent()
    {
        return $this->belongsTo(User::class);
    }
}
