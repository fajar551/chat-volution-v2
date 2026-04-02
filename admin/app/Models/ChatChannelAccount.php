<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatChannelAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_agent',
        'chat_channel_id',
        'phone_number',
        'api_id',
        'api_hash',
        'account_name',
        'account_username',
        'account_id',
        'wa_browser_id',
        'wa_secret_bundle',
        'wa_token_1',
        'wa_token_2',
        'account_session',
        'raw_response',
        'send_code_count',
        'status'
    ];

    public function agent()
    {
        return $this->belongsTo(Agent::class, 'id_agent', 'id');
    }

    public function channel()
    {
        return $this->belongsTo(Channel::class, 'chat_channel_id', 'id');
    }
}

