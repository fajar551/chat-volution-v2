<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAgentOauthClientsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('agent_oauth_clients', function (Blueprint $table) {
            $table->id();
            $table->uuid('agent_uuid');
            $table->string('name');
            $table->string('secret');
            $table->string('domain');
            $table->integer('personal_access_client');
            $table->integer('password_client');
            $table->integer('revoked');
            $table->unsignedBigInteger('created_by')->comment('agent id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('agent_oauth_clients');
    }
}
