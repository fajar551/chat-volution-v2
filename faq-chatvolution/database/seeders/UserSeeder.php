<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'name' => 'Admin Dev',
            'email' => 'dev.qwords@genioinfinity.com',
            'password' => Hash::make('81c8IGx2FI^$'),
        ]);

        User::create([
            'name' => 'Admin Qwords',
            'email' => 'admin@qwords.com',
            'password' => Hash::make('*NvH59KrAV2T'),
        ]);
    }
}
