<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDokterRequest;
use App\Models\Dokter;
use App\Models\JadwalDokter;
use App\Models\Kunjungan;
use Illuminate\Http\Request;

class DokterController extends Controller
{
    public function index(Request $request)
    {
        $query = Dokter::with(['poliklinik', 'jadwal']);

        if ($request->has('poli')) {
            $query->where('id_poli', $request->query('poli'));
        }

        return response()->json($query->get());
    }

    public function show(int $id)
    {
        $dokter = Dokter::with(['poliklinik', 'jadwal'])->findOrFail($id);

        return response()->json($dokter);
    }

    public function kuota(Request $request, int $id)
    {
        $validated = $request->validate([
            'tgl' => 'required|date',
        ], [
            'tgl.required' => 'Tanggal wajib diisi.',
            'tgl.date'     => 'Format tanggal tidak valid.',
        ]);

        Dokter::findOrFail($id);

        $hari = JadwalDokter::namaHari($validated['tgl']);
        $jadwal = JadwalDokter::where('id_dokter', $id)->where('hari', $hari)->first();

        if (!$jadwal) {
            return response()->json([
                'tgl'         => $validated['tgl'],
                'hari'        => $hari,
                'ada_jadwal'  => false,
            ]);
        }

        $terisi = Kunjungan::where('id_dokter', $id)
            ->where('tgl', $validated['tgl'])
            ->aktif()
            ->count();

        return response()->json([
            'tgl'         => $validated['tgl'],
            'hari'        => $hari,
            'ada_jadwal'  => true,
            'jam_mulai'   => substr($jadwal->jam_mulai, 0, 5),
            'jam_selesai' => substr($jadwal->jam_selesai, 0, 5),
            'kuota'       => $jadwal->kuota,
            'terisi'      => $terisi,
            'sisa'        => max($jadwal->kuota - $terisi, 0),
        ]);
    }

    public function store(StoreDokterRequest $request)
    {
        $validated = $request->validated();

        $dokter = Dokter::create($validated);

        return response()->json([
            'message' => 'Dokter berhasil ditambahkan.',
            'data'    => $dokter->load('poliklinik'),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $dokter = Dokter::findOrFail($id);

        $validated = $request->validate([
            'nama'      => 'sometimes|string|max:255',
            'spesialis' => 'sometimes|string|max:255',
            'id_poli'   => 'sometimes|string|exists:poliklinik,kode',
        ], [
            'nama.max'       => 'Nama dokter maksimal 255 karakter.',
            'spesialis.max'  => 'Spesialisasi maksimal 255 karakter.',
            'id_poli.exists' => 'Kode poliklinik tidak ditemukan.',
        ]);

        $dokter->update($validated);

        return response()->json([
            'message' => 'Data dokter berhasil diupdate.',
            'data'    => $dokter->load('poliklinik'),
        ]);
    }

    public function destroy(int $id)
    {
        $dokter = Dokter::findOrFail($id);

        if (Kunjungan::where('id_dokter', $id)->exists()) {
            return response()->json([
                'message' => 'Dokter memiliki riwayat kunjungan dan tidak bisa dihapus.',
            ], 409);
        }

        $dokter->delete();

        return response()->json([
            'message' => 'Dokter berhasil dihapus.',
        ]);
    }
}
