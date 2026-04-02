<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PollAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'poll_id',
        'choice_id',
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}
