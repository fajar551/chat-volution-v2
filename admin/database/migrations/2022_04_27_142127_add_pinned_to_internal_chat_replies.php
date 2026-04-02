<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPinnedToInternalChatReplies extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('internal_chat_replies', function (Blueprint $table) {
            $table->integer('is_pinned')->default(0)->after('parent');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('internal_chat_replies', function (Blueprint $table) {
            $table->dropColumn('is_pinned');
        });
    }
}
