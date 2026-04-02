<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddMetaSoundSettings extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('settings', function (Blueprint $table) {
            DB::statement("ALTER TABLE settings MODIFY COLUMN meta ENUM('welcome_message','away_message','closing_message','inbox_agent','chat_expired_time','sound_notification') NOT NULL COMMENT 'chat_expired_time: range time of system solve on going chat automatically' ");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('settings', function (Blueprint $table) {
            // Revert column meta
            // But can not be done because it will truncate the table
            // DB::statement("ALTER TABLE settings MODIFY COLUMN meta ENUM('welcome_message','away_message','closing_message','chat_expired_time') NOT NULL ");
        });
    }
}
