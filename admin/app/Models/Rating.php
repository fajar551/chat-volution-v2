<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id', 'id_agent', 'rating'
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'id_agent', 'id');
    }

    public function chat()
    {
        return $this->belongsTo(Chat::class, 'chat_id', 'chat_id');
    }
}
