<?php

use Database\Seeders\MenusSeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call(SmmSocmedChannelSeeder::class);
        $this->call(MenusSeeder::class);
    }
}
