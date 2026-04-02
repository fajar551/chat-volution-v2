<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class FileTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        \App\Models\File::factory(5)->create();
    }
}
