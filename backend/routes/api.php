<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DokterController;
use App\Http\Controllers\Api\JadwalDokterController;
use App\Http\Controllers\Api\KunjunganController;
use App\Http\Controllers\Api\PasienController;
use App\Http\Controllers\Api\PoliklinikController;
use Illuminate\Support\Facades\Route;

// ── Public Routes ──────────────────────────────
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::get('/poliklinik', [PoliklinikController::class, 'index']);
Route::get('/dokter', [DokterController::class, 'index']);
Route::get('/dokter/{id}', [DokterController::class, 'show']);
Route::get('/jadwal-dokter', [JadwalDokterController::class, 'index']);

// ── Protected Routes (Authenticated) ───────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Pasien Only
    Route::middleware('role:pasien')->group(function () {
        Route::post('/kunjungan', [KunjunganController::class, 'store']);
        Route::get('/kunjungan/saya', [KunjunganController::class, 'riwayatSaya']);
    });

    // Admin Only
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/dashboard', [DashboardController::class, 'index']);

        Route::post('/poliklinik', [PoliklinikController::class, 'store']);
        Route::put('/poliklinik/{kode}', [PoliklinikController::class, 'update']);
        Route::delete('/poliklinik/{kode}', [PoliklinikController::class, 'destroy']);

        // Dokter CRUD
        Route::post('/dokter', [DokterController::class, 'store']);
        Route::put('/dokter/{id}', [DokterController::class, 'update']);
        Route::delete('/dokter/{id}', [DokterController::class, 'destroy']);

        // Jadwal Dokter CRUD
        Route::post('/jadwal-dokter', [JadwalDokterController::class, 'store']);
        Route::put('/jadwal-dokter/{id}', [JadwalDokterController::class, 'update']);
        Route::delete('/jadwal-dokter/{id}', [JadwalDokterController::class, 'destroy']);

        // Antrian / Kunjungan Management
        Route::get('/kunjungan', [KunjunganController::class, 'index']);
        Route::patch('/kunjungan/{id}/panggil', [KunjunganController::class, 'panggil']);
        Route::patch('/kunjungan/{id}/selesai', [KunjunganController::class, 'selesai']);
        Route::patch('/kunjungan/{id}/batal', [KunjunganController::class, 'batal']);

        // Pasien Management
        Route::get('/pasien', [PasienController::class, 'index']);
        Route::get('/pasien/{no_rm}', [PasienController::class, 'show']);
    });
});
