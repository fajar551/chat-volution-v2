<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatLabel extends Model{
    protected $table = 'chat_label';

    public function label_detail()
    {
        return $this->belongsTo(Labels::class, 'id_labels', 'id');
    }

}
