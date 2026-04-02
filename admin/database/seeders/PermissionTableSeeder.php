<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Spatie\Permission\Models\Permission;

class PermissionTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $permissions = [
            'create-internal-chat',
            'read-internal-chat',
            'update-internal-chat',
            'delete-internal-chat',
         ];

         foreach ($permissions as $permission) {
              Permission::updateOrCreate(['name' => $permission], [
                    'guard_name' => 'api'
                ]);
         }
    }
}
