<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Hash;
use App\Models\Agent;

class AgentDocumentationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Agent::updateOrCreate(
            ['email' => 'dev@chatvolution.my.id'],
            [
            'name' => 'Dev ChatVolution',
            'email' => 'dev@chatvolution.my.id',
            'password' => Hash::make('chatvolution'),
            'phone' => null,
            'id_roles' => 5 // developer
        ]);

    }
}
