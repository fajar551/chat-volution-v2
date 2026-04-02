<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use App\Models\ChatGroup;
use App\Models\Agent;
use App\Models\AgentStatusAlias;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AgentStatusAliasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $all_agents = Agent::get();
        $tomorrow = Carbon::tomorrow();
        foreach ($all_agents as $key => $value) {
            $current_user = $value;
            $current_user_roles = $value ? $value->id_roles : null;

            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = Agent::find($current_user->id_company);
                $current_user_company_uuid = $current_user_company ? $current_user_company->uuid : null;
            } else {
                $current_user_company_uuid = $current_user->uuid; // uuid for agent with roles company
            }

            $store = AgentStatusAlias::updateOrCreate(
                ['agent_id' => $current_user->id],
                [
                    'uuid' => $current_user_company_uuid,
                    'name' => 'Example Status',
                    'expired_at' => $tomorrow
                ]
            );

        }
    }
}
