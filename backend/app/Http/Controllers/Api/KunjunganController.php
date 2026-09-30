<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BookingException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKunjunganRequest;
use App\Models\JadwalDokter;
use App\Models\Kunjungan;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        $pasien = $request->user()->pasien;

        if (!$pasien) {
            return response()->json(['message' => 'Data pasien tidak ditemukan.'], 404);
        }

        $validated['no_rm'] = $pasien->no_rm;

        $hariList = [1 => 'Senin', 2 => 'Selasa', 3 => 'Rabu', 4 => 'Kamis', 5 => 'Jumat', 6 => 'Sabtu', 7 => 'Minggu'];
        $hariIndex = Carbon::parse($validated['tgl'])->dayOfWeekIso;
        $namaHari = $hariList[$hariIndex] ?? '';

        try {
            $kunjungan = DB::transaction(function () use ($validated, $namaHari) {
                // Lock baris jadwal agar booking bersamaan untuk dokter yang sama diproses berurutan.
                $jadwal = JadwalDokter::where('id_dokter', $validated['id_dokter'])
                    ->where('hari', $namaHari)
                    ->lockForUpdate()
                    ->first();

                if (!$jadwal) {
                    throw new BookingException("Dokter tidak ada jadwal praktek pada hari {$namaHari}.");
                }

                $terisi = Kunjungan::where('id_dokter', $validated['id_dokter'])
                    ->where('tgl', $validated['tgl'])
                    ->whereIn('status', ['menunggu', 'dipanggil'])
                    ->count();

                if ($terisi >= $jadwal->kuota) {
                    throw new BookingException('Kuota antrian untuk tanggal ini sudah penuh.');
                }

                $sudahAda = Kunjungan::where('no_rm', $validated['no_rm'])
                    ->where('id_dokter', $validated['id_dokter'])
                    ->where('tgl', $validated['tgl'])
                    ->whereIn('status', ['menunggu', 'dipanggil'])
                    ->exists();

                if ($sudahAda) {
                    throw new BookingException('Anda sudah terdaftar di antrian dokter ini.');
                }

                $lastAntrian = Kunjungan::where('id_dokter', $validated['id_dokter'])
                    ->where('tgl', $validated['tgl'])
                    ->max('no_antrian') ?? 0;

                return Kunjungan::create([
                    'no_rm'      => $validated['no_rm'],
                    'id_dokter'  => $validated['id_dokter'],
                    'tgl'        => $validated['tgl'],
                    'no_antrian' => $lastAntrian + 1,
                    'status'     => 'menunggu',
                ]);
            });
        } catch (BookingException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (UniqueConstraintViolationException) {
            return response()->json(['message' => 'Antrian sedang padat, silakan coba lagi.'], 409);
        }

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

        if ($kunjungan->status !== 'dipanggil') {
            return response()->json(['message' => 'Hanya antrian berstatus "dipanggil" yang bisa diselesaikan.'], 422);
        }

        $kunjungan->update(['status' => 'selesai']);

        return response()->json(['message' => 'Kunjungan selesai.', 'data' => $kunjungan]);
    }

    public function batal($id)
    {
        $kunjungan = Kunjungan::findOrFail($id);

        if (!in_array($kunjungan->status, ['menunggu', 'dipanggil'], true)) {
            return response()->json(['message' => 'Antrian yang sudah selesai atau dibatalkan tidak bisa dibatalkan.'], 422);
        }

        $kunjungan->update(['status' => 'batal']);

        return response()->json(['message' => 'Kunjungan dibatalkan.', 'data' => $kunjungan]);
    }
}
