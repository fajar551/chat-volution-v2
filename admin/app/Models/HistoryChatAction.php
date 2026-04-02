<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoryChatAction extends Model
{
    protected $table = 'history_chat_action';

    protected $fillable = [
        'chat_id',
        'id_user',
        'id_agent',
        'action_name'
    ];
}
