<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatTransfersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_transfers', function (Blueprint $table) {
            $table->id();
            $table->integer('id_chat');
            $table->integer('from_agent')->comment('agent id');
            $table->integer('id_department')->nullable()->comment('transfer to department');
            $table->string('to_agent')->nullable()->comment('agent uuid');
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
        Schema::dropIfExists('chat_transfers');
    }
}
