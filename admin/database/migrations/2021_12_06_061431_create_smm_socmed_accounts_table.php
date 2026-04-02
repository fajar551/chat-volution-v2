<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSmmSocmedAccountsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('smm_socmed_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_socmed_id');
            $table->string('account_name');
            $table->string('alias_name')->nullable();
            $table->text('token');
            $table->string('account_email');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('smm_socmed_channel_id');
            $table->text('json_result');
            $table->integer('status')->default(1)->comment('0: inactive, 1: active');
            $table->unsignedBigInteger('created_by')->comment('filled by user id');
            $table->dateTime('expired_at')->nullable()->comment('token lifetime');
            $table->integer('run_schedule')->default(1)->comment('0: inactive, 1: active');
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
        Schema::dropIfExists('smm_socmed_accounts');
    }
}
