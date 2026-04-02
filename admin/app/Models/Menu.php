<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $fillable = [
        'role_id', 'list_menu', 'modul_type'
    ];

    public function role_id()
    {
        return $this->hashOne(Roles::class, 'id', 'role_id');
    }
}
