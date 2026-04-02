<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAgentStatusAliasesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('agent_status_aliases', function (Blueprint $table) {
            $table->id();
            $table->integer('agent_id');
            $table->string('uuid', 100)->comment('uuid_company');
            $table->string('name')->comment('status alias');
            $table->dateTime('expired_at')->nullable()->default(null);
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
        Schema::dropIfExists('agent_status_aliases');
    }
}
