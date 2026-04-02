<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChatChannelAccountsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('chat_channel_accounts', function (Blueprint $table) {
            $table->id();
            $table->integer('id_agent');
            $table->integer('chat_channel_id');
            $table->string('phone_number');
            $table->string('api_id')->nullable()->default(null);
            $table->string('api_hash')->nullable()->default(null);
            $table->string('account_name')->nullable()->default(null);
            $table->string('account_username')->nullable()->default(null);
            $table->string('account_id')->nullable()->default(null);
            $table->text('account_session')->nullable()->default(null)->comment('telegram session');
            $table->text('wa_browser_id')->nullable()->default(null);
            $table->text('wa_secret_bundle')->nullable()->default(null);
            $table->text('wa_token_1')->nullable()->default(null);
            $table->text('wa_token_2')->nullable()->default(null);
            // wa_browser_id
            // wa_secret_bundle
            // wa_token_1
            // wa_token_2
            $table->json('raw_response')->comment('the whole response')->nullable()->default(null);
            $table->integer('send_code_count')->nullable()->default(null); // how many times user click send code button, maximum 3 times
            $table->integer('status')->comment('0: inactive, 1: active')->default(0)->nullable();
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
        Schema::dropIfExists('chat_channel_accounts');
    }
}
