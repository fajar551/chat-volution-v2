<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agent;
use App\Models\Department;
use App\Services\AgentService;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AgentSeeder extends Seeder
{
    function __construct(AgentService $agent_service)
    {
        $this->agent_service = $agent_service;
    }


    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $company = Agent::where('email', 'developer@qwords.co.id')->first();
        $department = Department::where('id_agent', $company->id)->first();
        $staffs = [
            [
                'name' => 'Aep Saepudin',
                'email' => 'aep@qwords.co.id'
            ],

            [
                'name' => 'Alvin Aditya Rahman',
                'email' => 'alvin@qwords.co.id'
            ],

            [
                'name' => 'Andi Wijang',
                'email' => 'andiw@qwords.co.id'
            ],

            [
                'name' => 'Cecep Aprilianto',
                'email' => 'cecep@qwords.co.id'
            ],

            [
                'name' => 'Erik Romadhon',
                'email' => 'erik@qwords.co.id'
            ],

            [
                'name' => 'Erix Setiawan',
                'email' => 'erix@qwords.co.id'
            ],

            [
                'name' => 'Fauzi Arjanggi',
                'email' => 'fauzi@qwords.co.id'
            ],

            [
                'name' => 'Fransisca Juli W',
                'email' => 'fransisca@qwords.co.id'
            ],

            [
                'name' => 'Gilang Gumira P.U.K.',
                'email' => 'gilang@qwords.co.id'
            ],

            [
                'name' => 'Linda Pratiwi',
                'email' => 'pratiwi@qwords.co.id'
            ],

            [
                'name' => 'M Syafik Noor',
                'email' => 'syafik@qwords.co.id'
            ],

            [
                'name' => 'Norma Adi Kharisma F',
                'email' => 'norma@qwords.co.id'
            ],

            [
                'name' => 'Olga Vania Trixie Zuldhani',
                'email' => 'olga@qwords.co.id'
            ],

            [
                'name' => 'Saepudin Mulyono',
                'email' => 'saepudin@qwords.co.id'
            ],

            [
                'name' => 'Septi Manjani',
                'email' => 'septi@qwords.co.id'
            ],

            [
                'name' => 'Wahyu Mulyadi Panjaitan',
                'email' => 'wahyu@qwords.co.id'
            ],
        ];

        $current_user = $company;
        $current_user_roles = $company ? $company->id_roles : null;

        if($current_user_roles != 2 && $current_user_roles != 1) {
            $current_user_company = Agent::find($current_user['id_company']);
            $current_user_company_uuid = $current_user_company ? $current_user_company['uuid'] : null;
        } else {
            $current_user_company_uuid = $current_user['uuid']; // uuid for agent with roles company
        }

        foreach ($staffs as $key => $value) {
            $input_data = $value;
            $input_data['password'] = 'Test123!';
            $input_data['level'] = null;
            $input_data['id_roles'] = 3;
            $input_data['id_company'] = $company->id;
            $input_data['id_department'] = $department->id;
            $input_data['is_email_verified'] = 1;
            $input_data['status'] = 1;

            $input_data['uuid'] = $current_user_company_uuid; // for auth in service but not saved to agent data
            $this->agent_service->store($input_data);
        }
    }
}
