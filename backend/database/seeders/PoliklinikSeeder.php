<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PoliklinikSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Poliklinik::create(['kode' => 'UMUM', 'nama' => 'Poli Umum']);
        \App\Models\Poliklinik::create(['kode' => 'GIGI', 'nama' => 'Poli Gigi']);
        \App\Models\Poliklinik::create(['kode' => 'ANAK', 'nama' => 'Poli Anak']);
    }
}
