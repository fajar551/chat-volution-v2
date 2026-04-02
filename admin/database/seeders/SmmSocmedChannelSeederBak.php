<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SmmSocmedChannel;

class SmmSocmedChannelSeederBak extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        SmmSocmedChannel::upsert([
            [
                'slug' => 'facebook',
                'name' => 'Facebook',
                'description' => 'Page or Group',
                'image_logo' => '',
                'ic_logo' => '',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'instagram',
                'name' => 'Instagram',
                'description' => 'Business or Personal Account',
                'image_logo' => '',
                'ic_logo' => '',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'twitter',
                'name' => 'Twitter',
                'description' => '',
                'image_logo' => '',
                'ic_logo' => '',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'tiktok',
                'name' => 'TikTok',
                'description' => '',
                'image_logo' => '',
                'ic_logo' => '',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ], ['slug']);
    }
}
