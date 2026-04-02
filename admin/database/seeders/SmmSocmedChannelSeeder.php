<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SmmSocmedChannel;
use Illuminate\Support\Facades\Storage;

class SmmSocmedChannelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $data =
        [
            // facebook
            [
                ['slug' => 'facebook'],
                [
                    'name' => 'Facebook',
                    'description' => 'Page or Group',
                    'image_logo' => ('assets/images/socmed/socmed-icon-facebook.png'),
                    'ic_logo' => '',
                    'status' => 1,
                    'slug' => 'facebook',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ],
            // instagram
            [
                ['slug' => 'instagram'],
                [
                    'name' => 'Instagram',
                    'description' => 'Business or Personal Account',
                    'image_logo' => ('assets/images/socmed/socmed-icon-instagram.png'),
                    'ic_logo' => '',
                    'status' => 1,
                    'slug' => 'instagram',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ],
            // twitter
            [
                ['slug' => 'twitter'],
                [
                    'name' => 'Twitter',
                    'description' => '',
                    'image_logo' => ('assets/images/socmed/socmed-icon-twitter.png'),
                    'ic_logo' => '',
                    'status' => 1,
                    'slug' => 'twitter',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ],
            // tiktok
            [
                ['slug' => 'tiktok'],
                [
                    'name' => 'TikTok',
                    'description' => '',
                    'image_logo' => ('assets/images/socmed/socmed-icon-tiktok.png'),
                    'ic_logo' => '',
                    'status' => 1,
                    'slug' => 'tiktok',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]
        ];
        for($i = 0; $i < count($data); $i++) {
            SmmSocmedChannel::updateOrCreate($data[$i][0], $data[$i][1]);
        }
    }
}
