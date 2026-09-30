<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Set ADMIN_PASSWORD di .env. Tanpa itu: 'admin123' hanya di lingkungan local,
        // selain itu dibuat acak dan ditampilkan sekali di console.
        $password = env('ADMIN_PASSWORD');

        if (!$password) {
            if (app()->isLocal()) {
                $password = 'admin123';
            } else {
                $password = Str::random(16);
                $this->command?->warn("Password admin dibuat acak: {$password}");
            }
        }

        User::updateOrCreate(
            ['email' => 'admin@poliklinik.com'],
            ['name' => 'Administrator', 'password' => $password, 'role' => 'admin'],
        );
    }
}
