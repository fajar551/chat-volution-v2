<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInternalChatNotificationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('internal_chat_notifications', function (Blueprint $table) {
            $table->id();

            $table->char('chat_id', 11);
            $table->integer('chat_type')->comment('1: private, 2: group');
            $table->integer('id_chat');
            $table->integer('id_agent')->comment('receiver');
            $table->integer('from_agent')->nullable()->default(null);
            $table->integer('to_agent')->nullable()->default(null);
            $table->string('action')->nullable()->default(null)->comment('join/remove_agent');
            $table->string('description')->nullable()->default(null);
            $table->integer('is_read')->comment('0: unread, 1: read')->default(0);
            $table->timestamp('created_at')->default(\DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(\DB::raw('CURRENT_TIMESTAMP'));
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('internal_chat_notifications');
    }
}
