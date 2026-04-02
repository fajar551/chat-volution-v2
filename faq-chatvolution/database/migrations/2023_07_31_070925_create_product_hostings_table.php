<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductHostingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('product_hostings', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->string('pid')->unique();
            $table->string('panel');
            $table->string('kapasitas');
            $table->string('akun_email');
            $table->string('tipe_hosting');
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
        Schema::dropIfExists('product_hostings');
    }
}
