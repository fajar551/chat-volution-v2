<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChannelAgent;
use App\Models\Agent;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CompanyChatChannelAgentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create();
        $companies = Agent::where('id_roles', 2)->get();

        foreach ($companies as $key => $value) {
            for($i=0; $i<=2; $i++) {
                ChannelAgent::updateOrCreate(
                    [ 'id_agent' => $value['id'], 'channel_id' => $i+1 ],
                    [ 'id_agent' => $value['id'], 'channel_id' => $i+1 ]
                );
            }
        }
    }
}