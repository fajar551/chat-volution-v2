<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInternalChatJoinedHistoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('internal_chat_joined_histories', function (Blueprint $table) {
            $table->id();
            $table->char('chat_id', 11);
            $table->integer('id_chat');
            $table->integer('id_agent');
            $table->dateTime('added_date')->nullable()->default(null);
            $table->dateTime('removed_date')->nullable()->default(null);
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
        Schema::dropIfExists('internal_chat_joined_histories');
    }
}
