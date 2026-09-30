<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKunjunganRequest;
use App\Models\JadwalDokter;
use App\Models\Kunjungan;
use Carbon\Carbon;
use Illuminate\Http\Request;

class KunjunganController extends Controller
{
    public function index(Request $request)
    {
        $tanggal = $request->query('tanggal', now()->toDateString());

        $kunjungan = Kunjungan::with(['pasien', 'dokter.poliklinik'])
            ->where('tgl', $tanggal)
            ->orderBy('no_antrian')
            ->get();

        return response()->json($kunjungan);
    }

    public function riwayatSaya(Request $request)
    {
        $pasien = $request->user()->pasien;

        if (!$pasien) {
            return response()->json(['message' => 'Data pasien tidak ditemukan.'], 404);
        }

        $kunjungan = Kunjungan::with(['dokter.poliklinik'])
            ->where('no_rm', $pasien->no_rm)
            ->orderBy('tgl', 'desc')
            ->get();

        return response()->json($kunjungan);
    }

    public function store(StoreKunjunganRequest $request)
    {
        $validated = $request->validated();

        $hariList = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu'];
        $hariIndex = Carbon::parse($validated['tgl'])->dayOfWeekIso;
        $namaHari = $hariList[$hariIndex] ?? '';

        $jadwal = JadwalDokter::where('id_dokter', $validated['id_dokter'])
            ->where('hari', $namaHari)
            ->first();

        if (!$jadwal) {
            return response()->json(['message' => "Dokter tidak ada jadwal praktek pada hari {$namaHari}."], 422);
        }

        $terisi = Kunjungan::where('id_dokter', $validated['id_dokter'])
            ->where('tgl', $validated['tgl'])
            ->whereIn('status', ['menunggu', 'dipanggil'])
            ->count();

        if ($terisi >= $jadwal->kuota) {
            return response()->json(['message' => 'Kuota antrian untuk tanggal ini sudah penuh.'], 422);
        }

        $sudahAda = Kunjungan::where('no_rm', $validated['no_rm'])
            ->where('id_dokter', $validated['id_dokter'])
            ->where('tgl', $validated['tgl'])
            ->whereIn('status', ['menunggu', 'dipanggil'])
            ->exists();

        if ($sudahAda) {
            return response()->json(['message' => 'Anda sudah terdaftar di antrian dokter ini.'], 422);
        }

        $lastAntrian = Kunjungan::where('id_dokter', $validated['id_dokter'])
            ->where('tgl', $validated['tgl'])
            ->max('no_antrian') ?? 0;

        $kunjungan = Kunjungan::create([
            'no_rm'      => $validated['no_rm'],
            'id_dokter'  => $validated['id_dokter'],
            'tgl'        => $validated['tgl'],
            'no_antrian' => $lastAntrian + 1,
            'status'     => 'menunggu',
        ]);

        return response()->json([
            'message'    => 'Pendaftaran antrian berhasil!',
            'no_antrian' => $kunjungan->no_antrian,
            'data'       => $kunjungan->load(['pasien', 'dokter.poliklinik']),
        ], 201);
    }

    public function panggil($id)
    {
        $kunjungan = Kunjungan::findOrFail($id);

        if ($kunjungan->status !== 'menunggu') {
            return response()->json(['message' => 'Hanya antrian berstatus "menunggu" yang bisa dipanggil.'], 422);
        }

        $kunjungan->update(['status' => 'dipanggil']);

        return response()->json([
            'message' => 'Pasien berhasil dipanggil.',
            'data'    => $kunjungan->load(['pasien', 'dokter']),
        ]);
    }

    public function selesai($id)
    {
        $kunjungan = Kunjungan::findOrFail($id);
        $kunjungan->update(['status' => 'selesai']);

        return response()->json(['message' => 'Kunjungan selesai.', 'data' => $kunjungan]);
    }

    public function batal($id)
    {
        $kunjungan = Kunjungan::findOrFail($id);
        $kunjungan->update(['status' => 'batal']);

        return response()->json(['message' => 'Kunjungan dibatalkan.', 'data' => $kunjungan]);
    }
}
