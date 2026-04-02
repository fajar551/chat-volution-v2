<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddConversationDeletedToInternalChatJoinedHistories extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('internal_chat_joined_histories', function (Blueprint $table) {
            $table->integer('conversation_deleted')->nullable()->default(0)->after('removed_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('internal_chat_joined_histories', function (Blueprint $table) {
            $table->dropColumn('conversation_deleted');
        });
    }
}
