<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatFilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::dropIfExists('chat_files');
        Schema::create('chat_files', function (Blueprint $table) {
            $table->id();
            $table->integer('chat_reply_id')->nullable()->default(null);
            $table->char('chat_id', 11)->nullable()->default(null);
            $table->string('type')->nullable()->comment('image/video/other');
            $table->string('path');
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
        Schema::dropIfExists('chat_files');
    }
}
