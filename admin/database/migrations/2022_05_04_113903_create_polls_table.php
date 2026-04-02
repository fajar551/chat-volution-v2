<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePollsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('polls', function (Blueprint $table) {
            $table->id();
            $table->text('description')->nullable()->default(null);
            $table->integer('created_by');
            $table->integer('status')->default(0)->comment('0: inactive, 1: active');
            $table->dateTime('expired_at')->useCurrent();
            $table->integer('id_chat')->nullable();
            $table->char('chat_id', 11)->nullable();
            $table->integer('chat_reply_id')->nullable();
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
        Schema::dropIfExists('polls');
    }
}
