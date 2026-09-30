<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dokter;
use App\Models\Kunjungan;
use App\Models\Pasien;
use App\Models\Poliklinik;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $hariIni = now()->toDateString();
        $awal = now()->subDays(6)->toDateString();

        $statusHariIni = Kunjungan::where('tgl', $hariIni)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $perHari = Kunjungan::whereBetween('tgl', [$awal, $hariIni])
            ->select('tgl', DB::raw('count(*) as total'))
            ->groupBy('tgl')
            ->pluck('total', 'tgl');

        $tujuhHari = [];
        for ($i = 6; $i >= 0; $i--) {
            $tgl = now()->subDays($i)->toDateString();
            $tujuhHari[] = ['tgl' => $tgl, 'total' => (int) ($perHari[$tgl] ?? 0)];
        }

        $perPoli = DB::table('kunjungan')
            ->join('dokter', 'kunjungan.id_dokter', '=', 'dokter.id')
            ->join('poliklinik', 'dokter.id_poli', '=', 'poliklinik.kode')
            ->select('poliklinik.nama', DB::raw('count(*) as total'))
            ->groupBy('poliklinik.nama')
            ->orderByDesc('total')
            ->get();

        return response()->json([
            'total' => [
                'pasien'     => Pasien::count(),
                'dokter'     => Dokter::count(),
                'poliklinik' => Poliklinik::count(),
                'kunjungan_hari_ini' => Kunjungan::where('tgl', $hariIni)->count(),
            ],
            'status_hari_ini' => [
                'menunggu'  => (int) ($statusHariIni['menunggu'] ?? 0),
                'dipanggil' => (int) ($statusHariIni['dipanggil'] ?? 0),
                'selesai'   => (int) ($statusHariIni['selesai'] ?? 0),
                'batal'     => (int) ($statusHariIni['batal'] ?? 0),
            ],
            'tujuh_hari'     => $tujuhHari,
            'per_poliklinik' => $perPoli,
        ]);
    }
}
