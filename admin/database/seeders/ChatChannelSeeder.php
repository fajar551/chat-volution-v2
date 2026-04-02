<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Channel;
use App\Models\Agent;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatChannelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create();
        $channels = [
            [
                'name' => 'Live Chat',
                'description' => 'Live Chat on App',
                'status' => 1
            ],
            [
                'name' => 'Whatsapp',
                'description' => 'Whatsapp on App',
                'status' => 1
            ],
            [
                'name' => 'Telegram',
                'description' => 'Telegram on App',
                'status' => 1
            ],
        ];

        foreach ($channels as $key => $value) {
            for($i=0; $i<=2; $i++) {
                Channel::updateOrCreate(
                    [ 'name' => $value['name'] ],
                    [ 'name' => $value['name'], 'description' => $value['description'], 'status' => $value['status'] ]
                );
            }
        }
    }
}
