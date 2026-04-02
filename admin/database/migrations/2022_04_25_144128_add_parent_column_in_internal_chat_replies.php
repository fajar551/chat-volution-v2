<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddParentColumnInInternalChatReplies extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('internal_chat_replies', function (Blueprint $table) {
            $table->integer('parent')->nullable()->default(null)->after('message');
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
            $table->dropColumn('parent');
        });
    }
}
