<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChatGroup;
use App\Models\Agent;
use App\Services\ChatGroupService;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatGroupSeeder extends Seeder
{
    function __construct(ChatGroupService $chat_group_service)
    {
        $this->chat_group_service = $chat_group_service;
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $all_agents = Agent::get();

        foreach ($all_agents as $key => $value) {
            $current_user = $value;
            $current_user_roles = $value ? $value->id_roles : null;

            if($current_user_roles != 2 && $current_user_roles != 1) {
                $current_user_company = Agent::find($current_user['id_company']);
                $current_user_company_uuid = $current_user_company ? $current_user_company['uuid'] : null;
            } else {
                $current_user_company_uuid = $current_user['uuid']; // uuid for agent with roles company
            }

            $this->chat_group_service->store(
                [
                    'name' => 'Example Group',
                    'description' => 'Description of group',
                    'uuid' => $current_user_company_uuid,
                    'created_by' => $current_user['id']
                ]
            );
        }

    }

}