<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSmmPostsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('smm_posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('smm_socmed_account_id');
            $table->text('content');
            $table->integer('status')->default(0)->comment('0: not posted, 1: posted');
            // $table->string('file_url');
            $table->text('json_result')->nullable();
            $table->integer('smm_schedule_id');
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
        Schema::dropIfExists('smm_posts');
    }
}
