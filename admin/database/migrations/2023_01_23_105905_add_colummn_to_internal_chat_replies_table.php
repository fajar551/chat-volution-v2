<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddColummnToInternalChatRepliesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('internal_chat_replies', function (Blueprint $table) {
            $table->integer('from_anonymous')->default(0)->after('is_pinned')->comment('0: false, 1: true');
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
            $table->dropColumn('from_anonymous');
        });
    }
}
