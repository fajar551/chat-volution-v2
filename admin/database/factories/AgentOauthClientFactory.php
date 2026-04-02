<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

use function DI\create;

class AgentOauthClientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'agent_uuid' => Str::random(10),
            'name' => $this->faker->name(),
            'secret' => Str::random(40),
            'domain' => $this->faker->domainName(),
            'personal_access_client' => 1,
            'password_client' => 0,
            'revoked' => 0,
            'created_by' => 1,
        ];
    }
}
