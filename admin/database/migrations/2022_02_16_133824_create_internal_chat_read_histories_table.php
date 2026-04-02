<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInternalChatReadHistoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('internal_chat_read_histories', function (Blueprint $table) {
            $table->id();
            $table->char('chat_id', 11);
            $table->integer('id_chat');
            $table->integer('id_agent');
            $table->dateTime('unread_date')->nullable()->default(null);
            $table->dateTime('read_date')->nullable()->default(null);
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
        Schema::dropIfExists('internal_chat_read_histories');
    }
}
