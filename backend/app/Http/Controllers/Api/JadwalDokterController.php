<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJadwalDokterRequest;
use App\Models\JadwalDokter;
use Illuminate\Http\Request;

class JadwalDokterController extends Controller
{
    public function index(Request $request)
    {
        $query = JadwalDokter::with(['dokter.poliklinik']);

        if ($request->has('dokter')) {
            $query->where('id_dokter', $request->query('dokter'));
        }

        if ($request->has('hari')) {
            $query->where('hari', $request->query('hari'));
        }

        return response()->json($query->get());
    }

    public function store(StoreJadwalDokterRequest $request)
    {
        $validated = $request->validated();

        $duplikat = JadwalDokter::where('id_dokter', $validated['id_dokter'])
            ->where('hari', $validated['hari'])
            ->exists();

        if ($duplikat) {
            return response()->json([
                'message' => 'Dokter sudah memiliki jadwal di hari ' . $validated['hari'] . '.',
            ], 422);
        }

        $jadwal = JadwalDokter::create($validated);

        return response()->json([
            'message' => 'Jadwal dokter berhasil ditambahkan.',
            'data'    => $jadwal->load('dokter.poliklinik'),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $jadwal = JadwalDokter::findOrFail($id);

        $validated = $request->validate([
            'id_dokter'   => 'sometimes|integer|exists:dokter,id',
            'hari'        => 'sometimes|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jam_mulai'   => 'sometimes|date_format:H:i',
            'jam_selesai' => 'sometimes|date_format:H:i|after:jam_mulai',
            'kuota'       => 'sometimes|integer|min:1|max:100',
        ], [
            'id_dokter.exists'   => 'Dokter tidak ditemukan.',
            'hari.in'            => 'Hari tidak valid.',
            'jam_selesai.after'  => 'Jam selesai harus setelah jam mulai.',
            'kuota.min'          => 'Kuota minimal 1.',
            'kuota.max'          => 'Kuota maksimal 100.',
        ]);

        $idDokter = $validated['id_dokter'] ?? $jadwal->id_dokter;
        $hari     = $validated['hari'] ?? $jadwal->hari;

        $duplikat = JadwalDokter::where('id_dokter', $idDokter)
            ->where('hari', $hari)
            ->where('id', '!=', $id)
            ->exists();

        if ($duplikat) {
            return response()->json([
                'message' => 'Dokter sudah memiliki jadwal di hari ' . $hari . '.',
            ], 422);
        }

        $jadwal->update($validated);

        return response()->json([
            'message' => 'Jadwal dokter berhasil diupdate.',
            'data'    => $jadwal->load('dokter.poliklinik'),
        ]);
    }

    public function destroy(int $id)
    {
        $jadwal = JadwalDokter::findOrFail($id);
        $jadwal->delete();

        return response()->json([
            'message' => 'Jadwal dokter berhasil dihapus.',
        ]);
    }
}
