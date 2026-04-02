<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AgentOauthClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \App\Models\AgentOauthClient::factory(5)->create();
    }
}
