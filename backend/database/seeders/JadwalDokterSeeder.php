<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class JadwalDokterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\JadwalDokter::create(['id_dokter' => 1, 'hari' => 'Senin', 'jam_mulai' => '08:00', 'jam_selesai' => '12:00', 'kuota' => 20]);
        \App\Models\JadwalDokter::create(['id_dokter' => 2, 'hari' => 'Selasa', 'jam_mulai' => '09:00', 'jam_selesai' => '13:00', 'kuota' => 15]);
        \App\Models\JadwalDokter::create(['id_dokter' => 3, 'hari' => 'Rabu', 'jam_mulai' => '08:00', 'jam_selesai' => '11:00', 'kuota' => 15]);
    }
}
