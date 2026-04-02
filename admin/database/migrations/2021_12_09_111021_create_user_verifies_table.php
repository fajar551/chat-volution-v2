<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserVerifiesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_verifies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('agent_id');
            $table->string('token');
            $table->timestamps();
        });

        Schema::table('agent', function (Blueprint $table) {
            $table->boolean('is_email_verified')->default(0)->comment('0: false, 1: true');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_verifies');
        Schema::table('agent', function (Blueprint $table) {
            $table->dropColumn('is_email_verified');
        });
    }
}
