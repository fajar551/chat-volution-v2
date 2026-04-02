<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAnonymousAgentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('anonymous_agents', function (Blueprint $table) {
            $table->id();
            $table->string('anonymous_agent_id')->nullable();
            $table->string('key')->nullable();
            $table->string('name')->default('system');
            $table->string('image')->default(null)->nullable();
            $table->integer('chat_group_id');
            $table->integer('chat_group_internal_chat_id');
            $table->string('chat_id');
            $table->integer('created_by');
            $table->integer('id_chat');
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
        Schema::dropIfExists('anonymous_agents');
    }
}
