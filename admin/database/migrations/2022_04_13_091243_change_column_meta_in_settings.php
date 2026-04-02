<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class ChangeColumnMetaInSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("ALTER TABLE settings MODIFY COLUMN meta ENUM('welcome_message','away_message','closing_message','inbox_agent','chat_expired_time') NOT NULL COMMENT 'chat_expired_time: range time of system solve on going chat automatically' ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("ALTER TABLE settings MODIFY COLUMN meta ENUM('welcome_message','away_message','closing_message','inbox_agent') NOT NULL ");
    }
}
