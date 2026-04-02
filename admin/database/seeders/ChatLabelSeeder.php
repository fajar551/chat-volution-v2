<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Labels;
use App\Models\Agent;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatLabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create();
        $company = Agent::where('email', 'gina@qwords.co.id')->first();
        $staffs = Agent::where('id_roles', 3)->where('id_company', $company->id)->get();

        $new_label = [
            'id_agent' => '',
            'name' => 'Example label ',
            'description' => 'Example label',
            'color' => ['#1f75cb', '#fd7e14', '#e83e8', '#108548']
        ];

        for($i=0; $i<3; $i++) {
            Labels::create([
                'id_agent' => $company->id,
                'name' => $new_label['name'].($i+1),
                'description' => $new_label['description'],
                'color' => $faker->randomElement($new_label['color'])
            ]);
        }

        foreach ($staffs as $key => $value) {
            for($i=0; $i<2; $i++) {
                Labels::create([
                    'id_agent' => $value['id'],
                    'name' => $new_label['name'].'Staff '.($i+1),
                    'description' => $new_label['description'],
                    'color' => $faker->randomElement($new_label['color'])
                ]);
            }
        }
    }
}