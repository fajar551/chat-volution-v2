<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInternalChatsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('internal_chats', function (Blueprint $table) {
            $table->id();
            $table->string('uuid', 100)->comment('uuid_company');
            $table->char('chat_id', 11);
            $table->integer('chat_type')->comment('1: private, 2: group');
            $table->string('noted', 500)->nullable()->default(null);
            $table->integer('status')->comment('0: inactive, 1: on going');
            $table->string('browser')->nullable()->default(null);
            $table->string('device')->nullable()->default(null);
            $table->string('ip')->nullable()->default(null);
            $table->integer('unread_count')->default(0);
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
        Schema::dropIfExists('internal_chats');
    }
}
