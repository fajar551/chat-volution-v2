<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUserJsonToAgentAndUserTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('agent', function (Blueprint $table) {
            $table->json('user_json')->nullable()->default(null);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->json('user_json')->nullable()->default(null);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('agent', function (Blueprint $table) {
            $table->dropColumn('user_json');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('user_json');
        });
    }
}
