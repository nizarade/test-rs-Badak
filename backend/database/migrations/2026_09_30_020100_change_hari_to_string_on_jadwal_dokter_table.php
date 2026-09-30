<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Enum hari tidak memuat 'Minggu'; validasi nilai dilakukan di request.
    public function up(): void
    {
        Schema::table('jadwal_dokter', function (Blueprint $table) {
            $table->string('hari', 10)->change();
        });
    }

    public function down(): void
    {
        Schema::table('jadwal_dokter', function (Blueprint $table) {
            $table->enum('hari', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])->change();
        });
    }
};
