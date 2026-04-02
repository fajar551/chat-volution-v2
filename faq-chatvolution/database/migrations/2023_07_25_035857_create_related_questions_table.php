<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRelatedQuestionsTable extends Migration
{
    public function up()
    {
        Schema::create('related_questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('question_id');
            $table->string('related_question');
            $table->text('answer', 500);
            $table->string('type');
            $table->timestamps();

            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
        });
    }


    public function down()
    {
        Schema::dropIfExists('related_questions');
    }
}

