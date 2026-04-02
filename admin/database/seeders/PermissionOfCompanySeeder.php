<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\User;
use Spatie\Permission\Models\Permission;

class PermissionOfCompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        # get agent with User class
        $companies = User::where('id_roles', 2)
        // ->where('email', 'developer@qwords.co.id') // speficic company
        ->get();

        $permission = Permission::where('name', 'like', '%-internal-chat')->get(); // get permission

        foreach ($companies as $agent) {
            $give_pr = $agent->givePermissionTo($permission);
        }
    }
}
