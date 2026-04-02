<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMeetingUrlToInternalChatReplies extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('internal_chat_replies', function (Blueprint $table) {
            $table->string('meeting_url')->nullable()->default(null)->after('is_pinned');
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
            $table->dropColumn('meeting_url');
        });
    }
}
