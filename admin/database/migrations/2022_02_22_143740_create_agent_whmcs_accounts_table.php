<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAgentWhmcsAccountsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('agent_whmcs_accounts', function (Blueprint $table) {
            $table->id();
            $table->integer('id_agent');
            $table->string('uuid', 100)->comment('uuid_company');
            $table->string('domain');
            $table->string('identifier');
            $table->string('secret');
            $table->integer('status')->nullable()->default(0)->comment('0: inactive, 1: active');
            $table->json('raw_response')->nullable()->default(null);
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
        Schema::dropIfExists('agent_whmcs_accounts');
    }
}
