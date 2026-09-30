<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kunjungan', function (Blueprint $table) {
            $table->id();
            $table->string('no_rm');
            $table->foreignId('id_dokter')->constrained('dokter')->onDelete('cascade');
            $table->date('tgl');
            $table->integer('no_antrian');
            $table->enum('status', ['menunggu', 'dipanggil', 'selesai', 'batal'])
                ->default('menunggu');
            $table->timestamps();

            $table->foreign('no_rm')->references('no_rm')->on('pasien')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kunjungan');
    }
};
