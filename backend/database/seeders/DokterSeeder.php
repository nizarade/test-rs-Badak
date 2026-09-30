<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DokterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Dokter::create(['nama' => 'dr. Budi', 'spesialis' => 'Umum', 'id_poli' => 'UMUM']);
        \App\Models\Dokter::create(['nama' => 'drg. Sari', 'spesialis' => 'Gigi', 'id_poli' => 'GIGI']);
        \App\Models\Dokter::create(['nama' => 'dr. Andi', 'spesialis' => 'Anak', 'id_poli' => 'ANAK']);
    }
}
