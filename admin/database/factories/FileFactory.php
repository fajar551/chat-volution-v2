<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class FileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        $faker = \Faker\Factory::create();
        $faker->addProvider(new \WW\Faker\Provider\Picture($faker));

        return [
            // 'url' => '/assets/images/uploads/'.$faker->picture(storage_path('/assets/images/uploads'), 300, 300, false, 0)
            'url' => '/assets/images/uploads/'.$faker->picture(public_path('/assets/images/uploads'), 300, 300, false, 0)
        ];
    }
}
