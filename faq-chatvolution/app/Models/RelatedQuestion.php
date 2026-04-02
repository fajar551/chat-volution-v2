<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RelatedQuestion extends Model
{
    use HasFactory;
    protected $fillable = ['question_id', 'type', 'related_question', 'answer'];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
